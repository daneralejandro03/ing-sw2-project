import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Nombre de la categoría',
        minLength: 1,
        maxLength: 100,
        example: 'Electrónica',
    })
    @IsString()
    @Length(1, 100)
    name: string;
}
