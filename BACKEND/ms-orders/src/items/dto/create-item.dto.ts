import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    description: 'Nombre descriptivo del ítem',
    maxLength: 255,
    example: 'Camiseta roja talla M',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Cantidad de unidades de este ítem (entero mínimo 1)',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto (número >= 0)',
    minimum: 0,
    example: 25.5,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}
