import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCityDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    name: string;
}
