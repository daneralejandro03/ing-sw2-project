import { IsString, IsNotEmpty, Length, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCityDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    name: string;

    @Type(() => Number)
    @IsInt()
    departamentId: number;
}
