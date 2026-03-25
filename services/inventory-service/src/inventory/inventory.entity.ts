import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("inventory")
export class Inventory {
  @PrimaryColumn()
  productId!: string;

  @Column()
  stock!: number;
}
