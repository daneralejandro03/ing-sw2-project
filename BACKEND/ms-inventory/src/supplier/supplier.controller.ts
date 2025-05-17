import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@ApiTags('Supplier')
@ApiBearerAuth()
@Controller('supplier')
export class SupplierController {
  constructor(private readonly suppService: SupplierService) { }

  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiBody({ type: CreateSupplierDto })
  @ApiResponse({ status: 201, description: 'Proveedor creado', type: Supplier })
  @Post()
  create(
    @Body() dto: CreateSupplierDto,
  ): Promise<Supplier> {
    return this.suppService.create(dto);
  }

  @ApiOperation({ summary: 'Listar todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Listado de proveedores', type: [Supplier] })
  @Get()
  findAll(): Promise<Supplier[]> {
    return this.suppService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado', type: Supplier })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Supplier> {
    return this.suppService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un proveedor existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiBody({ type: UpdateSupplierDto })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado', type: Supplier })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.suppService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado correctamente' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.suppService.remove(id);
  }
}
