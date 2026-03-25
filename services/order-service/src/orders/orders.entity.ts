import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  productId!: string;

  @Column()
  quantity!: number;

  @Column()
  amount!: number;

  @Column()
  status!: string;
}
