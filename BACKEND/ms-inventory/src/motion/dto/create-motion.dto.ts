import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from '../enumeration/type.enumeration';

export class CreateMotionDto {
    @ApiProperty({ description: 'Fecha del movimiento en formato ISO 8601' })
    @IsDateString()
    date: string;

    @ApiProperty({ description: 'Tipo de movimiento: IN (ingreso) o OUT (salida)', enum: Type })
    @IsEnum(Type)
    type: Type;

    @ApiProperty({ description: 'Cantidad del movimiento, mínimo 1', minimum: 1, type: Number })
    @IsInt()
    @Min(1)
    amount: number;

    @ApiProperty({ description: 'ID del inventario asociado', type: Number })
    @IsInt()
    inventoryId: number;
}
