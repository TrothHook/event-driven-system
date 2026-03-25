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

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.log("✅ Inventory Kafka connected");
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log("🔌 Inventory Kafka disconnected");
  }

  getConsumer(): Consumer {
    return this.consumer;
  }
}
