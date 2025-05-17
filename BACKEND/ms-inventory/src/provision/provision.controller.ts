import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProvisionService } from './provision.service';
import { Provision } from './entities/provision.entity';
import { Product } from '../product/entities/product.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Provision')
@ApiBearerAuth()
@Controller('provision')
export class ProvisionController {
  constructor(private readonly provService: ProvisionService) { }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva provisión de producto por proveedor' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID del producto' })
  @ApiParam({ name: 'supplierId', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 201, description: 'Provisión creada', type: Provision })
  @Post('product/:productId/supplier/:supplierId')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('supplierId', ParseIntPipe) supplierId: number,
  ): Promise<Provision> {
    return this.provService.create(productId, supplierId);
  }

  @ApiOperation({ summary: 'Obtener todas las provisiones' })
  @ApiResponse({ status: 200, description: 'Listado de provisiones', type: [Provision] })
  @Get()
  findAll(): Promise<Provision[]> {
    return this.provService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una provisión por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la provisión' })
  @ApiResponse({ status: 200, description: 'Provisión encontrada', type: Provision })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Provision> {
    return this.provService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una provisión por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la provisión' })
  @ApiResponse({ status: 200, description: 'Provisión eliminada correctamente' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.provService.remove(id);
  }

  @ApiOperation({ summary: 'Obtener proveedores asociados a un producto' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Listado de proveedores', type: [Supplier] })
  @Get('product/:productId')
  findSuppliersByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Supplier[]> {
    return this.provService.findSuppliersByProduct(productId);
  }

  @ApiOperation({ summary: 'Obtener productos asociados a un proveedor' })
  @ApiParam({ name: 'supplierId', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Listado de productos', type: [Product] })
  @Get('supplier/:supplierId')
  findProductsBySupplier(
    @Param('supplierId', ParseIntPipe) supplierId: number,
  ): Promise<Product[]> {
    return this.provService.findProductsBySupplier(supplierId);
  }
}
