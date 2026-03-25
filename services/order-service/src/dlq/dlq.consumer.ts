import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Kafka } from "kafkajs";

@Injectable()
export class DLQConsumer implements OnModuleInit {
  private readonly logger = new Logger(DLQConsumer.name);

  private kafka = new Kafka({
    clientId: "dlq-consumer",
    brokers: [process.env.KAFKA_BROKER || "redpanda:9092"],
  });

  private consumer = this.kafka.consumer({ groupId: "dlq-group" });

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: "payment.failed",
    });

    this.logger.log("💀 Listening to DLQ (payment.failed)...");

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString() || "{}";
        const data = JSON.parse(raw);

        this.logger.warn(`💀 DLQ event received: ${raw}`);

        //For now just log
        //Later: retry / alert / manual replay
      },
    });
  }
}
