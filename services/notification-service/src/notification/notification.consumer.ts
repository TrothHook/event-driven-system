import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Kafka } from "kafkajs";
import { EmailService } from "./email.service";

interface PaymentEvent {
  orderId: string;
  status: "SUCCESS" | "FAILED";
}

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  private kafka = new Kafka({
    clientId: "notification-service",
    brokers: [process.env.KAFKA_BROKER || "redpanda:9092"],
  });

  private consumer = this.kafka.consumer({
    groupId: "notification-group",
  });

  constructor(private emailService: EmailService) {}

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: "payment.success" });
    await this.consumer.subscribe({ topic: "payment.failed" });

    this.logger.log("Listening to payment events from notification service");

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const raw = message.value?.toString() || "{}";
        const data: PaymentEvent = JSON.parse(raw);

        if (topic === "payment.success") {
          await this.emailService.sendEmail(
            "boron.roy@gmail.com",
            "Payment Successful",
            `Order ${data.orderId} completed successfully`,
          );
        }

        if (topic === "payment.failed") {
          await this.emailService.sendEmail(
            "boron.roy@gmail.com",
            "Payment Failed",
            `Order ${data.orderId} failed`,
          );
        }
      },
    });
  }
}
