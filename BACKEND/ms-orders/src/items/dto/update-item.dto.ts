import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @ApiPropertyOptional({ description: 'Nombre del ítem' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Cantidad del ítem' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Precio unitario del ítem' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Precio total del ítem' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalPrice?: number;

  @ApiPropertyOptional({ description: 'ID del producto asociado' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  product?: string;

  @ApiPropertyOptional({ description: 'ID de la orden a la que pertenece' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  orderId?: string;
}
