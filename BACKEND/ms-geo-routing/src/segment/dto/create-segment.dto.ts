import { IsInt, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateSegmentDto {
    @IsInt()
    @IsNotEmpty()
    sequence: number;

    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}
