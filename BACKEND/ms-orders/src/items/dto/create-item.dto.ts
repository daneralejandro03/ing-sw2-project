import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    description: 'Cantidad de unidades de este ítem (entero mínimo 1)',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}