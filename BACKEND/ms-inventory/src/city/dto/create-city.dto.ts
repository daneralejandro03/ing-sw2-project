import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCityDto {
    @ApiProperty({ description: 'Nombre de la ciudad', minLength: 2, maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    name: string;
}
