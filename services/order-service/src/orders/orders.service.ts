import { Injectable } from "@nestjs/common";
import { KafkaService } from "../kafka/kafka.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class OrdersService {
  private orders: any[] = [];

  constructor(private kafkaService: KafkaService) {}

  async createOrder(data: any) {
    const order = {
      id: uuidv4(),
      status: "CREATED",
      ...data,
    };

    this.orders.push(order);

    // publish event
    await this.kafkaService.sendEvent("order.created", order);

    return order;
  }
}
