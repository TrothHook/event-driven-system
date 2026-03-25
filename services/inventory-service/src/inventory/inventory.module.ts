import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Inventory } from "./inventory.entity";
import { InventoryService } from "./inventory.service";
import { InventoryConsumer } from "./inventory.consumer";
import { KafkaModule } from "../kafka/kafka.module";

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), KafkaModule],
  providers: [InventoryService, InventoryConsumer],
})
export class InventoryModule {}
