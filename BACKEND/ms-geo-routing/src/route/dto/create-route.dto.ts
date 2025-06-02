import { IsNumber, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
    @ApiProperty({
        description: 'Latitud del destino de la ruta',
        example: -34.6037389,
    })
    @IsNumber()
    @IsNotEmpty()
    destinationLat: number;

    @ApiProperty({
        description: 'Longitud del destino de la ruta',
        example: -58.3815704,
    })
    @IsNumber()
    @IsNotEmpty()
    destinationLng: number;

    @ApiProperty({
        description: 'ID numérico de la tienda (store) desde donde se inicia la ruta',
        example: 42,
    })
    @IsInt()
    @IsNotEmpty()
    pickupFromStore: number;
}
