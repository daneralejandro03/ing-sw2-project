import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { OrderState } from './order-state.enum';

export class UpdateOrderDTO {
  @IsOptional()
  @IsEnum(OrderState)
  state?: OrderState;

  @IsOptional()
  @IsUUID()
  deliveryDriver?: string;
}
