import { Module } from "@nestjs/common";
import { OrdersModule } from "./orders/orders.module";
import { DatabaseModule } from "./database/database.module";
import { DLQConsumer } from "./dlq/dlq.consumer";
import { OutboxModule } from "./outbox/outbox.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    OrdersModule,
    OutboxModule,
  ],
  providers: [DLQConsumer],
})
export class AppModule {}
