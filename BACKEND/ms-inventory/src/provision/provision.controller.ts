import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProvisionService } from './provision.service';
import { Provision } from './entities/provision.entity';
import { Product } from '../product/entities/product.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

@Controller('provision')
export class ProvisionController {
  constructor(private readonly provService: ProvisionService) { }

  @Post('product/:productId/supplier/:supplierId')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('supplierId', ParseIntPipe) supplierId: number,
  ): Promise<Provision> {
    return this.provService.create(productId, supplierId);
  }

  @Get()
  findAll(): Promise<Provision[]> {
    return this.provService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Provision> {
    return this.provService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.provService.remove(id);
  }

  @Get('product/:productId')
  findSuppliersByProduct(
    @Param('productId', ParseIntPipe) productId: number
  ): Promise<Supplier[]> {
    return this.provService.findSuppliersByProduct(productId);
  }

  @Get('supplier/:supplierId')
  findProductsBySupplier(
    @Param('supplierId', ParseIntPipe) supplierId: number
  ): Promise<Product[]> {
    return this.provService.findProductsBySupplier(supplierId);
  }
}
