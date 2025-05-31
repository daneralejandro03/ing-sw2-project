import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class CreateOrderDto {
  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  address1: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  department: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @IsString()
  userGuest: string;

  @ApiProperty()
  @IsString()
  userDeliveryDriver: string;
}
