import { Module } from "@nestjs/common";
import { InventoryModule } from "./inventory/inventory.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, InventoryModule],
})
export class AppModule {}
