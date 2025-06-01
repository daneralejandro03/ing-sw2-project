import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Estado inicial de la orden',
    enum: OrderStatus,
    example: OrderStatus.UNASSIGNED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Monto total de la orden',
    minimum: 0,
    example: 123.45,
  })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    description: 'Moneda de la transacción (código ISO de 3 caracteres)',
    minLength: 3,
    maxLength: 3,
    example: 'USD',
  })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    description: 'Línea principal de la dirección de entrega',
    maxLength: 255,
    example: 'Calle 123 #45-67',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address1: string;

  @ApiPropertyOptional({
    description: 'Segunda línea de la dirección (opcional)',
    maxLength: 255,
    example: 'Apartamento 5B',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address2?: string;

  @ApiProperty({
    description: 'Ciudad de entrega',
    maxLength: 100,
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Departamento/estado de entrega',
    maxLength: 100,
    example: 'Cundinamarca',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiProperty({
    description: 'Código postal o ZIP',
    minimum: 0,
    example: 110111,
  })
  @IsNumber()
  @Min(0)
  postalCode: number;

  @ApiPropertyOptional({
    description: 'Instrucciones adicionales para la entrega',
    maxLength: 500,
    example: 'Dejar en la portería si no hay nadie.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  instructions?: string;

  @ApiProperty({
    description: 'Método de pago utilizado',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Estado del pago',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

}
