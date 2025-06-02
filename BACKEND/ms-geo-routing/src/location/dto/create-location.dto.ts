import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Latitud de la ubicación del repartidor',
    example: -34.6037389,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitud de la ubicación del repartidor',
    example: -58.3815704,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
