import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/shared/enums/order-status.enum';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Estado de la asignación',
    enum: OrderStatus,
    example: OrderStatus.ASSIGNED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Nota explicativa para la asignación',
    maxLength: 500,
    example: 'Repartidor asignado correctamente',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note: string;

  @ApiProperty({
    description: 'Fecha y hora de la asignación',
    type: 'string',
    format: 'date-time',
    example: '2025-06-01T10:30:00Z',
  })
  @Type(() => Date)
  @IsDate()
  date: Date;
}
