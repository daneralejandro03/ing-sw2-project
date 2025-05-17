import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreDto {
    @ApiProperty({ description: 'Nombre de la tienda' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Código único de la tienda' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: 'Dirección completa de la tienda' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ description: 'Código postal' })
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty({ description: 'Longitud geográfica', type: Number })
    @Type(() => Number)
    @IsNumber()
    longitude: number;

    @ApiProperty({ description: 'Latitud geográfica', type: Number })
    @Type(() => Number)
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: 'Capacidad máxima de almacenamiento', type: Number })
    @Type(() => Number)
    @IsInt()
    capacity: number;

    @ApiProperty({ description: 'Estado o región donde opera la tienda' })
    @IsString()
    @IsNotEmpty()
    state: string;
}
