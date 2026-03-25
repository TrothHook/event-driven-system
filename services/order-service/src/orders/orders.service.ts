import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./orders.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OutboxEvent } from "../outbox/outbox.entity";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OutboxEvent)
    private outboxRepo: Repository<OutboxEvent>,
  ) {}

  async createOrder(data: CreateOrderDto) {
    //Create order
    const order = this.orderRepo.create({
      ...data,
      status: "CREATED",
    });

    //Save order
    const savedOrder = await this.orderRepo.save(order);

    //Save event to outbox (NOT Kafka directly)
    await this.outboxRepo.save({
      topic: "order.created",
      payload: savedOrder,
    });

    this.logger.log("Order saved + event stored in outbox");

    //Return response
    return savedOrder;
  }
}
