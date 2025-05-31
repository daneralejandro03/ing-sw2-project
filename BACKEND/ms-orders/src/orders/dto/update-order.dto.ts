import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/shared/enums/payment-method.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { CreateItemDto } from 'src/items/dto/create-item.dto';
import { CreateAssignmentDto } from 'src/assignments/dto/create-assignment.dto';

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userGuest?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userDeliveryDriver?: string;

  @ApiPropertyOptional({ type: [CreateItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  @IsOptional()
  items?: CreateItemDto[];

  @ApiPropertyOptional({ type: [CreateAssignmentDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentDto)
  @IsOptional()
  assignments?: CreateAssignmentDto[];
}
