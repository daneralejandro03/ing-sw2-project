import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { Item } from 'src/items/entities/item.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear una nuevo pedido' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Pedido creado', type: Order })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de pedidos',
    type: [Order],
  })
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del pedido' })
  @ApiResponse({ status: 200, description: 'pedido encontrado', type: Order })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pedido existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del pedido' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Pedido actualizado',
    type: Order,
  })
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id')
  updatePartial(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pedido' })
  @ApiParam({ name: 'id', type: String, description: 'ID del pedido' })
  @ApiResponse({ status: 200, description: 'pedido eliminado' })  remove(@Param('id', ParseIntPipe) id: string) {
    return this.orderService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Asociar un ítem existente a un pedido' })
  @ApiParam({ name: 'orderId', description: 'ID del pedido' })
  @ApiParam({ name: 'itemId', description: 'ID del ítem' })
  associateItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<Item> {
    return this.orderService.associateItem(orderId, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':orderId/assignments/:assignmentId')
  @ApiOperation({ summary: 'Asociar una asignación existente a un pedido' })
  @ApiParam({ name: 'orderId', description: 'ID del pedido' })
  @ApiParam({ name: 'assignmentId', description: 'ID de la asignación' })
  associateAssignment(
    @Param('orderId') orderId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<Assignment> {
    return this.orderService.associateAssignment(orderId, assignmentId);
  }
}
