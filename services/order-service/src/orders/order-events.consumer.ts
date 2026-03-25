import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Kafka } from "kafkajs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./orders.entity";
import { ProcessedEvent } from "../processed-events/processed-event.entity";

interface PaymentEvent {
  orderId: string;
  status: "SUCCESS" | "FAILED";
}

@Injectable()
export class OrderEventsConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderEventsConsumer.name);

  private kafka = new Kafka({
    clientId: "order-service-consumer",
    brokers: [process.env.KAFKA_BROKER || "redpanda:9092"],
  });

  private consumer = this.kafka.consumer({ groupId: "order-group" });

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(ProcessedEvent)
    private processedRepo: Repository<ProcessedEvent>,
  ) {}

  async onModuleInit() {
    this.logger.log("Starting Order Events Consumer...");

    await this.consumer.connect();

    await this.consumer.subscribe({ topic: "payment.success" });
    await this.consumer.subscribe({ topic: "payment.failed" });

    this.logger.log("Listening to payment events...");

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const raw = message.value?.toString() || "{}";
          const data: PaymentEvent = JSON.parse(raw);

          this.logger.log(`Received ${topic}: ${raw}`);

          await this.updateOrderStatus(data);
        } catch (error) {
          this.logger.error("Failed to process event", error);
        }
      },
    });
  }

  async updateOrderStatus(event: PaymentEvent) {
    const { orderId, status } = event;

    const eventId = `${orderId}-${status}`;

    //check for duplicate
    const exists = await this.processedRepo.findOne({ where: { eventId } });

    if (exists) {
      this.logger.warn(`Duplicate event skipped: ${eventId}`);
      return;
    }

    const newStatus = status === "SUCCESS" ? "COMPLETED" : "FAILED";

    const result = await this.orderRepo.update(orderId, {
      status: newStatus,
    });

    //mark processed
    await this.processedRepo.save({ eventId });

    if (result.affected === 0) {
      this.logger.warn(`Order ${orderId} not found`);
      return;
    }

    this.logger.log(`Order ${orderId} updated to ${newStatus}`);
  }
}
