import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @Type(() => Number)
    @IsNumber()
    longitude: number;

    @Type(() => Number)
    @IsNumber()
    latitude: number;


    @Type(() => Number)
    @IsInt()
    capacity: number;

    @IsString()
    @IsNotEmpty()
    state: string;

}
