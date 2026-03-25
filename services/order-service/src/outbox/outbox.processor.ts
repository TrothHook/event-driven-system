import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OutboxEvent } from "./outbox.entity";
import { KafkaService } from "../kafka/kafka.service";

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    @InjectRepository(OutboxEvent)
    private outboxRepo: Repository<OutboxEvent>,
    private kafkaService: KafkaService,
  ) {}

  @Cron("*/5 * * * * *") // every 5 seconds
  async handleCron() {
    await this.processOutbox();
  }

  async processOutbox() {
    const events = await this.outboxRepo.find({
      where: { processed: false },
      take: 10,
      order: { createdAt: "ASC" },
    });

    for (const event of events) {
      try {
        this.logger.log(`Sending event ${event.id}`);

        await this.kafkaService.sendEvent(event.topic, event.payload);

        event.processed = true;
        await this.outboxRepo.save(event);

        this.logger.log(`Outbox event sent: ${event.id}`);
      } catch (err) {
        this.logger.error(`Failed to send outbox event ${event.id}`);
      }
    }
  }
}
