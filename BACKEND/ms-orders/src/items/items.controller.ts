import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Item } from './entities/item.entity';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) { }

  @Post('order/:orderId/product/:productId')
  @ApiOperation({ summary: 'Crear nuevo ítem para una orden' })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    description: 'ID de la orden Mongo',
  })
  @ApiParam({
    name: 'productId',
    type: 'number',
    description: 'ID del producto (entero)',
  })
  @ApiBody({
    type: CreateItemDto,
    description: 'Datos del ítem a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Ítem creado exitosamente.',
    type: Item,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o recurso no encontrado.' })
  async create(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createItemDto: CreateItemDto,
  ): Promise<Item> {
    return this.itemsService.create(orderId, productId, createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los ítems' })
  @ApiResponse({
    status: 200,
    description: 'Listado de ítems.',
    type: [Item],
  })
  async findAll(): Promise<Item[]> {
    return this.itemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ítem por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del ítem Mongo',
  })
  @ApiResponse({
    status: 200,
    description: 'Ítem encontrado.',
    type: Item,
  })
  @ApiResponse({ status: 400, description: 'Ítem no encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un ítem existente' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID del ítem a actualizar',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nombre del producto modificado' },
        quantity: { type: 'number', minimum: 1, example: 2 },
        unitPrice: { type: 'number', minimum: 0, example: 50.0 },
        totalPrice: { type: 'number', minimum: 0, example: 100.0 },
      },
    },
    description: 'Campos a actualizar en el ítem',
  })
  @ApiResponse({
    status: 200,
    description: 'Ítem actualizado.',
    type: Item,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o ítem no existente.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<CreateItemDto>,
  ): Promise<Item> {
    return this.itemsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un ítem por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID del ítem a eliminar',
  })
  @ApiResponse({ status: 204, description: 'Ítem eliminado.' })
  @ApiResponse({ status: 400, description: 'Ítem no encontrado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.itemsService.remove(id);
  }
}
