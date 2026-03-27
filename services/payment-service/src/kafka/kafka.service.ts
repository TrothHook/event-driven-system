import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Consumer, Kafka } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka = new Kafka({
    clientId: "payment-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });
  private consumer: Consumer = this.kafka.consumer({
    groupId: "payment-group",
  });
  private producer = this.kafka.producer();
  private isShuttingDown = false;

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    await this.disconnectConsumer();
    await this.producer.disconnect();
  }

  /**
   * Connect the internal consumer with retry/backoff. This does NOT
   * subscribe or run; consumers should call `getConsumer()` and then
   * subscribe/run themselves. This preserves per-message retry semantics
   * in the consumer implementations.
   */
  async connectConsumerWithRetry() {
    while (!this.isShuttingDown) {
      try {
        await this.consumer.connect();

        this.logger.log("Consumer connected to Kafka");
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Consumer connect failed: ${message}. Retrying in 5 seconds.`,
        );
        await this.disconnectConsumer();
        this.consumer = this.kafka.consumer({ groupId: "payment-group" });
        await this.delay(5000);
      }
    }
  }

  private async disconnectConsumer() {
    try {
      await this.consumer.disconnect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to disconnect payment consumer cleanly: ${message}`,
      );
    }
  }

  private async delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  // NOTE: business logic (processPayment / message-level retry) belongs in
  // consumer classes. Keeping producer helper here for sending events.

  getConsumer(): Consumer {
    return this.consumer;
  }

  async sendEvent(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  }
}
