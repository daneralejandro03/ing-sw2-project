import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) { }

  @Post('order/:orderId/DeliveryDriver/:userDeliveryDriver')
  @ApiOperation({ summary: 'Crear nueva asignación de repartidor para una orden' })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    format: 'uuid',
    description: 'ID de la orden (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'userDeliveryDriver',
    type: 'string',
    description: 'ID del repartidor (ObjectId de MongoDB)',
    example: '605c3f1e2e8f4b1a9a123456',
  })
  @ApiBody({
    type: CreateAssignmentDto,
    description: 'Datos de la asignación (status, note, date)',
  })
  @ApiResponse({
    status: 201,
    description: 'Asignación creada exitosamente.',
    type: Assignment,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o recurso no encontrado.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async create(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('userDeliveryDriver') userDeliveryDriver: string,
    @Headers('authorization') authHeader: string,
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentsService.create(
      orderId,
      userDeliveryDriver,
      createAssignmentDto,
      authHeader,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las asignaciones' })
  @ApiResponse({
    status: 200,
    description: 'Listado de asignaciones.',
    type: [Assignment],
  })
  async findAll(): Promise<Assignment[]> {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID de la asignación (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación encontrada.',
    type: Assignment,
  })
  @ApiResponse({ status: 400, description: 'Asignación no encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Assignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación existente' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID de la asignación a actualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['UNASSIGNED', 'ASSIGNED', 'ATTEMPTED', 'REJECTED'],
        },
        note: { type: 'string', maxLength: 500 },
        date: { type: 'string', format: 'date-time' },
      },
    },
    description: 'Campos a actualizar en la asignación',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada.',
    type: Assignment,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o asignación no existente.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    return this.assignmentsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID de la asignación a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Asignación eliminada.' })
  @ApiResponse({ status: 400, description: 'Asignación no encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.assignmentsService.remove(id);
  }
}
