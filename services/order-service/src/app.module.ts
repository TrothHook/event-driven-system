import { Module } from "@nestjs/common";
import { OrdersModule } from "./orders/orders.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, OrdersModule],
})
export class AppModule {}
