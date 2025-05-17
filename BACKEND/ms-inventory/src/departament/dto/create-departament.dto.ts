import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateDepartamentDto {
    @ApiProperty({ description: 'Nombre del departamento', minLength: 2, maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    name: string;
}
