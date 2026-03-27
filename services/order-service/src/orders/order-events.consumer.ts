import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Kafka } from "kafkajs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./orders.entity";
import { ProcessedEvent } from "../processed-events/processed-event.entity";
import { KafkaService } from "../kafka/kafka.service";

interface PaymentEvent {
  orderId: string;
  status: "SUCCESS" | "FAILED";
}

interface InventoryEvent {
  orderId: string;
  productId: string;
  quantity: number;
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

    private kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    this.logger.log("Starting Order Events Consumer...");

    await this.consumer.connect();

    await this.consumer.subscribe({ topic: "payment.success" });
    await this.consumer.subscribe({ topic: "payment.failed" });
    await this.consumer.subscribe({ topic: "inventory.updated" });

    this.logger.log("Listening to order-related events...");

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const raw = message.value?.toString() || "{}";

          this.logger.log(`Received ${topic}: ${raw}`);

          if (topic === "payment.success") {
            const data: PaymentEvent = JSON.parse(raw);
            await this.updateOrderStatus(data, "PAYMENT_COMPLETED");
          }

          if (topic === "payment.failed") {
            const data: PaymentEvent = JSON.parse(raw);
            await this.updateOrderStatus(data, "FAILED");
          }

          if (topic === "inventory.updated") {
            const inventoryData: InventoryEvent = JSON.parse(raw);
            await this.handleInventoryUpdated(inventoryData);
          }
        } catch (error) {
          this.logger.error("Failed to process event", error);
        }
      },
    });
  }

  async updateOrderStatus(
    event: PaymentEvent,
    status: "CREATED" | "PAYMENT_COMPLETED" | "COMPLETED" | "FAILED",
  ) {
    const { orderId } = event;

    const eventId = `${orderId}-${status}`;

    //check for duplicate
    const exists = await this.processedRepo.findOne({ where: { eventId } });

    if (exists) {
      this.logger.warn(`Duplicate event skipped: ${eventId}`);
      return;
    }

    const result = await this.orderRepo.update(orderId, {
      status,
    });

    if (result.affected === 0) {
      this.logger.warn(`Order ${orderId} not found`);
      return;
    }

    //mark processed
    await this.processedRepo.save({ eventId });

    this.logger.log(`Order ${orderId} updated to ${status}`);
  }

  async handleInventoryUpdated(data: InventoryEvent) {
    const eventId = `${data.orderId}-inventory-updated`;

    const exists = await this.processedRepo.findOne({
      where: { eventId },
    });

    if (exists) {
      this.logger.warn(`Duplicate inventory event skipped: ${eventId}`);
      return;
    }

    const order = await this.orderRepo.findOne({
      where: { id: data.orderId },
    });

    if (!order) return;

    if (order.status !== "PAYMENT_COMPLETED") {
      this.logger.warn(`Order not ready for completion`);
      return;
    }

    await this.orderRepo.update(data.orderId, {
      status: "COMPLETED",
    });

    // mark processed BEFORE emitting (important)
    await this.processedRepo.save({ eventId });

    await this.kafkaService.sendEvent("order.confirmed", {
      orderId: data.orderId,
    });

    this.logger.log(`Order confirmed: ${data.orderId}`);
  }
}
