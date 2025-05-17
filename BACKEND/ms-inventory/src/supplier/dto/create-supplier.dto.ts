import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
    @ApiProperty({
        description: 'Nombre del proveedor',
        minLength: 1,
        maxLength: 100,
        example: 'Proveedor Ejemplo'
    })
    @IsString()
    @Length(1, 100)
    name: string;
}
