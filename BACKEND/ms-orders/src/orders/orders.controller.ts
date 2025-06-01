import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('userGuest/:userGuestId/store/:storeId')
  @ApiOperation({ summary: 'Crear nueva orden' })
  @ApiParam({
    name: 'userGuestId',
    type: 'string',
    description: 'ID del usuario invitado (ObjectId de MongoDB)',
    example: '605c3f1e2e8f4b1a9a123456',
  })
  @ApiParam({
    name: 'storeId',
    type: 'number',
    description: 'ID de la tienda (entero)',
    example: 42,
  })
  @ApiBody({ type: CreateOrderDto, description: 'Datos de la orden' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente.', type: Order })
  @ApiResponse({ status: 400, description: 'Datos inválidos o recurso no encontrado.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async create(
    @Param('userGuestId') userGuestId: string,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Headers('authorization') authHeader: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.create(userGuestId, storeId, createOrderDto, authHeader);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las órdenes' })
  @ApiResponse({ status: 200, description: 'Listado de órdenes.', type: [Order] })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID de la orden (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Orden encontrada.', type: Order })
  @ApiResponse({ status: 400, description: 'Orden no encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar orden existente' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID de la orden a actualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['UNASSIGNED', 'ASSIGNED', 'ATTEMPTED', 'REJECTED'] },
        totalAmount: { type: 'number' },
        currency: { type: 'string', example: 'USD' },
        address1: { type: 'string' },
        address2: { type: 'string', nullable: true },
        city: { type: 'string' },
        department: { type: 'string' },
        postalCode: { type: 'number' },
        instructions: { type: 'string', nullable: true },
        paymentMethod: { type: 'string', enum: ['CREDITCARD', 'CASH'] },
        paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
      },
    },
    description: 'Campos para actualizar en la orden',
  })
  @ApiResponse({ status: 200, description: 'Orden actualizada.', type: Order })
  @ApiResponse({ status: 400, description: 'Datos inválidos o orden no existente.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('authorization') authHeader: string,
    @Body() updateData: Partial<CreateOrderDto>,
  ): Promise<Order> {
    return this.ordersService.update(id, updateData, authHeader);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar orden por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID de la orden a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Orden eliminada.' })
  @ApiResponse({ status: 400, description: 'Orden no encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ordersService.remove(id);
  }
}
