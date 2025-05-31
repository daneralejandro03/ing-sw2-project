import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { Type as AssignmentType } from '../entities/assignment.entity';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Fecha de la asignación en formato ISO' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Estado de la asignación', enum: AssignmentType })
  @IsEnum(AssignmentType)
  status: AssignmentType;

  @ApiProperty({ description: 'Nota adicional sobre la asignación' })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({ description: 'Usuario encargado de la entrega' })
  @IsString()
  @IsNotEmpty()
  userDeliveryUser: string;

  @ApiProperty({ description: 'ID de la orden asociada' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
