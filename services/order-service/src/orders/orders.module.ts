import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { KafkaModule } from "../kafka/kafka.module";
import { Order } from "./orders.entity";
import { OrderEventsConsumer } from "./order-events.consumer";
import { ProcessedEvent } from "../processed-events/processed-event.entity";
import { OutboxEvent } from "../outbox/outbox.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, ProcessedEvent, OutboxEvent]), KafkaModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderEventsConsumer],
})
export class OrdersModule {}
