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
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeoAssignmentService } from './geo-assignment.service';
import { CreateGeoAssignmentDto } from './dto/create-geo-assignment.dto';
import { UpdateGeoAssignmentDto } from './dto/update-geo-assignment.dto';
import { GeoAssignment } from './entities/geo-assignment.entity';
import { AssignmentResponse } from '../assignment/interface/AssignmentResponse.interface';


import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('GeoAssignments')
@ApiBearerAuth() // Solo esto, no es necesario @ApiHeader adicional
@Controller('geo-assignments')
export class GeoAssignmentController {
  constructor(private readonly geoService: GeoAssignmentService) { }


  // --- NUEVO ENDPOINT PARA ASIGNACIÓN POR PROXIMIDAD ---
  @Post('assignProximity/order/:orderId')
  @ApiOperation({ summary: 'Asignar orden al repartidor más cercano y crear GeoAssignment' })
  @ApiParam({ name: 'orderId', description: 'ID de la Orden (UUID o string)', type: String })
  @ApiResponse({
    status: 201,
    description: 'Orden asignada y GeoAssignment creado (si aplica). Devuelve la asignación y el geo-assignment.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o la orden no se puede asignar.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado (orden, tienda, repartidores).' })
  async assignByProximity(
    @Param('orderId') orderId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<{ assignment: AssignmentResponse, geoAssignment?: GeoAssignment }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o con formato incorrecto.');
    }
    const token = authHeader.substring(7); // Extrae el token
    return this.geoService.assignOrderToNearestDriverAndCreateGeoAssignment(orderId, token);
  }

  /**
   * POST /geo-assignments
   * - Headers: Authorization: 'Bearer <token>' (para validar el usuario/repartidor en JwtAuthGuard)
   * - Body: { assignmentId, distanceToPickup, distanceToDrop }
   * Crea un nuevo GeoAssignment con su Route y sus Segments.
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo GeoAssignment (directamente si ya existe una asignación)' })
  @ApiBody({ type: CreateGeoAssignmentDto })
  @ApiResponse({
    status: 201,
    description: 'GeoAssignment creado correctamente.',
    type: GeoAssignment,
  })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async create(
    @Body() createDto: CreateGeoAssignmentDto,
    @Headers('authorization') authHeader: string,
  ): Promise<GeoAssignment> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o con formato incorrecto');
    }
    const token = authHeader.substring(7); // Eliminamos "Bearer" 
    console.log(`Token recibido: ${token}`); // Para depuración, puedes eliminarlo en producción   
    return this.geoService.create(createDto, token);
  }

  /**
   * GET /geo-assignments
   * Retorna todos los GeoAssignments (con su Route y Segmentos, gracias a eager: true).
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los GeoAssignments' })
  @ApiResponse({
    status: 200,
    description: 'Listado de GeoAssignments retornado.',
    type: GeoAssignment,
    isArray: true,
  })
  async findAll(): Promise<GeoAssignment[]> {
    return this.geoService.findAll();
  }

  /**
   * GET /geo-assignments/:id
   * Retorna un GeoAssignment específico por su ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener GeoAssignment por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del GeoAssignment',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'GeoAssignment encontrado.',
    type: GeoAssignment,
  })
  @ApiResponse({ status: 404, description: 'GeoAssignment no encontrado.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GeoAssignment> {
    return this.geoService.findOne(id);
  }

  /**
   * PATCH /geo-assignments/:id
   * Actualiza distanceToPickup y/o distanceToDrop.
   * Body: { distanceToPickup?, distanceToDrop? }
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar GeoAssignment (solo distancias)' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del GeoAssignment a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateGeoAssignmentDto })
  @ApiResponse({
    status: 200,
    description: 'GeoAssignment actualizado correctamente.',
    type: GeoAssignment,
  })
  @ApiResponse({ status: 404, description: 'GeoAssignment no encontrado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGeoAssignmentDto,
  ): Promise<GeoAssignment> {
    return this.geoService.update(id, updateDto);
  }

  /**
   * DELETE /geo-assignments/:id
   * Elimina un GeoAssignment (y en cascada su Route y Segmentos).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar GeoAssignment por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del GeoAssignment a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'GeoAssignment eliminado.' })
  @ApiResponse({ status: 404, description: 'GeoAssignment no encontrado.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.geoService.remove(id);
  }
}
