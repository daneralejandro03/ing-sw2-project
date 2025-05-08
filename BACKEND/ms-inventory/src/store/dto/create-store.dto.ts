import {
    IsString,
    IsNotEmpty,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @Type(() => Number)
    @IsInt()
    length: number;

    @Type(() => Number)
    @IsInt()
    latitude: number;

    @Type(() => Number)
    @IsInt()
    capacity: number;

    @IsString() @IsNotEmpty() state: string;

    @Type(() => Number)
    @IsInt()
    cityId: number;

    @IsString()
    @IsNotEmpty()
    userId: string;
}
