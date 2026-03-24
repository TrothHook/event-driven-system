import { IsString, IsNumber } from "class-validator";

export class CreateOrderDto {
  @IsString()
  userId!: string;

  @IsString()
  productId!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  amount!: number;
}
