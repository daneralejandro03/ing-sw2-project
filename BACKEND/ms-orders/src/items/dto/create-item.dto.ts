import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @ApiProperty({ description: 'Nombre del ítem' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Cantidad del ítem' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Precio unitario del ítem' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiProperty({ description: 'Precio total del ítem' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @ApiProperty({ description: 'ID del producto asociado' })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ description: 'ID de la orden a la que pertenece' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
