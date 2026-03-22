import { Injectable, OnModuleInit } from "@nestjs/common";
import { Kafka } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: "order-service",
    brokers: [process.env.KAFKA_BROKER || "redpanda:9092"],
  });

  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
    console.log("Kafka Producer Connected");
  }

  async sendEvent(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
