import { IsInt, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSegmentDto {
    @ApiProperty({
        description: 'Orden o posición del segmento dentro de la ruta (entero).',
        example: 1,
    })
    @IsInt()
    @IsNotEmpty()
    sequence: number;

    @ApiProperty({
        description: 'Latitud del punto geográfico del segmento.',
        example: -34.6037389,
    })
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @ApiProperty({
        description: 'Longitud del punto geográfico del segmento.',
        example: -58.3815704,
    })
    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}
