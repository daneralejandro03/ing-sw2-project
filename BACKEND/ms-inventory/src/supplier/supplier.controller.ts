import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly suppService: SupplierService) { }

  @Post()
  create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return this.suppService.create(dto);
  }

  @Get()
  findAll(): Promise<Supplier[]> {
    return this.suppService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Supplier> {
    return this.suppService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto
  ): Promise<Supplier> {
    return this.suppService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.suppService.remove(id);
  }
}
