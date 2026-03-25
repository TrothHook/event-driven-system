import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OutboxEvent } from "./outbox.entity";
import { OutboxProcessor } from "./outbox.processor";
import { KafkaModule } from "../kafka/kafka.module";

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent]), KafkaModule],
  providers: [OutboxProcessor],
})
export class OutboxModule {}
