import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  private kafka = new Kafka({
    clientId: "inventory-service",
    brokers: [process.env.KAFKA_BROKER || "redpanda:9092"],
  });

  private consumer: Consumer = this.kafka.consumer({
    groupId: "inventory-group",
  });
  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    this.logger.log("✅ Inventory Kafka connected (consumer + producer)");
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
    } catch (err) {
      this.logger.warn('Producer disconnect failed', String(err));
    }

    try {
      await this.consumer.disconnect();
    } catch (err) {
      this.logger.warn('Consumer disconnect failed', String(err));
    }

    this.logger.log("🔌 Inventory Kafka disconnected");
  }

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
