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
import { BadRequestException } from '@nestjs/common';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Type(() => Number)
    @IsNumber()
    unitPrice: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    stock: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    levelReorder: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    sku: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    barcode: string;

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

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    weightKg: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    lengthCm: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    widthCm: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    heightCm: number;

    @IsBoolean()
    isFragile: boolean;

    @IsBoolean()
    requiresRefurbishment: boolean;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    status: string;
}
