import { Controller, Get, Post, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { Product } from 'src/product/entities/product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam
} from '@nestjs/swagger';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @UseGuards(JwtAuthGuard)
  @Post('store/:storeId/product/:productId')
  @ApiOperation({ summary: 'Agregar producto al inventario de una tienda' })
  @ApiParam({ name: 'storeId', type: Number, description: 'ID de la tienda' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 201, description: 'Inventario creado', type: Inventory })
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Inventory> {
    return this.inventoryService.create(storeId, productId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de inventario' })
  @ApiResponse({ status: 200, description: 'Listado de inventarios', type: [Inventory] })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de inventario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del inventario' })
  @ApiResponse({ status: 200, description: 'Registro de inventario encontrado', type: Inventory })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de inventario' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del inventario' })
  @ApiResponse({ status: 200, description: 'Inventario eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Obtener productos en inventario por tienda' })
  @ApiParam({ name: 'storeId', type: Number, description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Listado de productos', type: [Product] })
  findByStore(@Param('storeId', ParseIntPipe) storeId: number): Promise<Product[]> {
    return this.inventoryService.findProductsByStore(storeId);
  }
}
