import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsInt,
    IsDate,
    IsBoolean,
    MaxLength,
    Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

export class CreateProductDto {
    @ApiProperty({ description: 'Nombre del producto', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({ description: 'Descripción detallada del producto' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Precio unitario del producto', type: Number })
    @Type(() => Number)
    @IsNumber()
    unitPrice: number;

    @ApiProperty({ description: 'Cantidad en stock disponible', type: Number, minimum: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stock: number;

    @ApiProperty({ description: 'Nivel de reorder del producto', type: Number, minimum: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    levelReorder: number;

    @ApiProperty({ description: 'SKU único del producto', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    sku: string;

    @ApiProperty({ description: 'Código de barras del producto', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    barcode: string;

    @ApiProperty({ description: 'Fecha de ingreso en formato DD/MM/YYYY', type: String, example: '31/12/2024' })
    @Transform(({ value }) => {
        if (typeof value !== 'string') {
            throw new BadRequestException(
                'dateEntry debe ser una cadena con formato DD/MM/YYYY'
            );
        }
        const parts = value.split('/');
        if (parts.length !== 3) {
            throw new BadRequestException(
                'dateEntry debe tener formato DD/MM/YYYY'
            );
        }
        const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
        const dt = new Date(yyyy, mm - 1, dd);
        if (isNaN(dt.getTime())) {
            throw new BadRequestException(
                'dateEntry no es una fecha válida en formato DD/MM/YYYY'
            );
        }
        return dt;
    }, { toClassOnly: true })
    @IsDate({ message: 'dateEntry transformado no es una Date válida' })
    dateEntry: Date;

    @ApiProperty({ description: 'Fecha de expiración en formato DD/MM/YYYY', type: String, example: '01/01/2025' })
    @Transform(({ value }) => {
        if (typeof value !== 'string') {
            throw new BadRequestException(
                'expirationDate debe ser una cadena con formato DD/MM/YYYY'
            );
        }
        const parts = value.split('/');
        if (parts.length !== 3) {
            throw new BadRequestException(
                'expirationDate debe tener formato DD/MM/YYYY'
            );
        }
        const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
        const dt = new Date(yyyy, mm - 1, dd);
        if (isNaN(dt.getTime())) {
            throw new BadRequestException(
                'expirationDate no es una fecha válida en formato DD/MM/YYYY'
            );
        }
        return dt;
    }, { toClassOnly: true })
    @IsDate({ message: 'expirationDate transformado no es una Date válida' })
    expirationDate: Date;

    @ApiProperty({ description: 'Peso en kilogramos', type: Number, minimum: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    weightKg: number;

    @ApiProperty({ description: 'Longitud en centímetros', type: Number, minimum: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    lengthCm: number;

    @ApiProperty({ description: 'Ancho en centímetros', type: Number, minimum: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    widthCm: number;

    @ApiProperty({ description: 'Altura en centímetros', type: Number, minimum: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    heightCm: number;

    @ApiProperty({ description: 'Indica si el producto es frágil' })
    @IsBoolean()
    isFragile: boolean;

    @ApiProperty({ description: 'Indica si requiere reacondicionamiento' })
    @IsBoolean()
    requiresRefurbishment: boolean;

    @ApiProperty({ description: 'Estado del producto', maxLength: 50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    status: string;
}
