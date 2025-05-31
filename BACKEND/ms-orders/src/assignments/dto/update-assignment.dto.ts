import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type as AssignmentType } from '../entities/assignment.entity';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ description: 'Fecha de la asignación en formato ISO' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Estado de la asignación', enum: AssignmentType })
  @IsEnum(AssignmentType)
  @IsOptional()
  status?: AssignmentType;

  @ApiPropertyOptional({ description: 'Nota adicional sobre la asignación' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  note?: string;

  @ApiPropertyOptional({ description: 'Usuario encargado de la entrega' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  userDeliveryUser?: string;

  @ApiPropertyOptional({ description: 'ID de la orden asociada' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  orderId?: string;
}
