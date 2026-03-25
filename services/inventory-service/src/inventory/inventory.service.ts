import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Inventory } from "./inventory.entity";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    private dataSource: DataSource,
  ) {}

  async decreaseStock(productId: string, quantity: number) {
    return this.dataSource.transaction(async (manager) => {
      //LOCK ROW (CRITICAL)
      const item = await manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: "pessimistic_write" }, //key
      });

      if (!item) {
        throw new Error(`Product ${productId} not found`);
      }

      if (item.stock < quantity) {
        throw new Error(`Insufficient stock for ${productId}`);
      }

      item.stock -= quantity;

      await manager.save(item);

      this.logger.log(`Stock updated: ${productId} → remaining ${item.stock}`);
    });
  }
}
