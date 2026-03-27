import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { KafkaService } from "../kafka/kafka.service";
import { InventoryService } from "./inventory.service";

interface PaymentEvent {
  orderId: string;
  status: "SUCCESS" | "FAILED";
  productId?: string;
  quantity?: number;
}

@Injectable()
export class InventoryConsumer implements OnModuleInit {
  private readonly logger = new Logger(InventoryConsumer.name);

  constructor(
    private kafkaService: KafkaService,
    private inventoryService: InventoryService,
  ) {}

  async onModuleInit() {
    const consumer = this.kafkaService.getConsumer();

    await consumer.subscribe({
      topic: "payment.success",
    });

    this.logger.log("Listening to payment.success for inventory");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const raw = message.value?.toString() || "{}";
          const data: any = JSON.parse(raw);

          this.logger.log(`Payment success received: ${raw}`);

          //IMPORTANT: ensure these fields exist in event
          await this.inventoryService.decreaseStock(
            data.productId,
            data.quantity,
          );
          //NEW EVENT
          await this.kafkaService.sendEvent("inventory.updated", {
            orderId: data.orderId,
            productId: data.productId,
            quantity: data.quantity,
          });
          this.logger.log(`Inventory updated event emitted`);
        } catch (err) {
          this.logger.error("Inventory update failed", err);
        }
      },
    });
  }
}
