import { IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from '../enumeration/type.enumeration';

export class CreateMotionDto {
    @IsDateString()
    date: string;

    @IsEnum(Type)
    type: Type;

    @IsInt()
    @Min(1)
    amount: number;

    @IsInt()
    inventoryId: number;
}
