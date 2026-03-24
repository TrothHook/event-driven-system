import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./orders.entity";
import { KafkaService } from "../kafka/kafka.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private kafkaService: KafkaService,
  ) {}

  async createOrder(data: CreateOrderDto) {
    const order = this.orderRepo.create({
      ...data,
      status: "CREATED",
    });

    const savedOrder = await this.orderRepo.save(order);

    try {
      await this.kafkaService.sendEvent("order.created", savedOrder);
      console.log("Event published to Kafka topic 'order.created'")
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`Failed to publish Kafka event: ${message}`);

      // optional: mark for retry / outbox (advanced)
    }

    return savedOrder;
  }
}
