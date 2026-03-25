import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("outbox_events")
export class OutboxEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  topic!: string;

  @Column("json")
  payload: any;

  @Column({ default: false })
  processed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
