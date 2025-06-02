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
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Route } from './entities/route.entity';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

// (Opcional) tu guardia de JWT
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Routes')
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) { }

  /**
   * POST /routes/:geoAssignmentId
   *
   * - Parámetro URL: geoAssignmentId  
   * - Header: Authorization: 'Bearer <token>' (para validar existencia del store en ms-Inventory)  
   * - Body: CreateRouteDto { destinationLat, destinationLng, pickupFromStore }
   */
  @Post(':geoAssignmentId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una ruta para un geo-assignment existente' })
  @ApiParam({
    name: 'geoAssignmentId',
    description: 'ID numérico del GeoAssignment al que pertenece la ruta',
    type: Number,
    example: 5,
  })
  @ApiBody({ type: CreateRouteDto })
  @ApiResponse({
    status: 201,
    description: 'Ruta creada correctamente.',
    type: Route,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la ruta.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'GeoAssignment no encontrado.' })
  async create(
    @Param('geoAssignmentId', ParseIntPipe) geoAssignmentId: number,
    @Body() createDto: CreateRouteDto,
    @Headers('authorization') authHeader: string,
  ): Promise<Route> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o sin formato válido');
    }
    const token = authHeader.slice(7);
    return this.routeService.create(geoAssignmentId, createDto, token);
  }

  /**
   * GET /routes
   * - Devuelve todas las rutas.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de rutas retornado.',
    type: Route,
    isArray: true,
  })
  async findAll(): Promise<Route[]> {
    return this.routeService.findAll();
  }

  /**
   * GET /routes/:id
   * - Devuelve la ruta específica por routeId.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ruta por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la ruta',
    type: Number,
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta encontrada.',
    type: Route,
  })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Route> {
    return this.routeService.findOne(id);
  }

  /**
   * PATCH /routes/:id
   * - Actualiza campos permitidos de la ruta.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ruta existente' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la ruta a actualizar',
    type: Number,
    example: 3,
  })
  @ApiBody({ type: UpdateRouteDto })
  @ApiResponse({
    status: 200,
    description: 'Ruta actualizada correctamente.',
    type: Route,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos para actualización.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRouteDto,
  ): Promise<Route> {
    return this.routeService.update(id, updateDto);
  }

  /**
   * DELETE /routes/:id
   * - Elimina la ruta (y sus segmentos en cascada).
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ruta por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la ruta a eliminar',
    type: Number,
    example: 3,
  })
  @ApiResponse({ status: 204, description: 'Ruta eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.routeService.remove(id);
  }

  /**
   * GET /routes/:id/store
   *
   * - Devuelve los datos del store asociado a la ruta :id.
   * - Header: Authorization: 'Bearer <token>'
   */
  @Get(':id/store')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener datos del store asociado a la ruta' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la ruta',
    type: Number,
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del store retornados.',
  })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async getStore(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authHeader: string,
  ): Promise<any> {
    const route = await this.routeService.findOne(id);
    if (!route) {
      throw new NotFoundException(`Route #${id} no encontrada`);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o sin formato válido');
    }
    const token = authHeader.slice(7);

    return this.routeService.getStoreDetails(route.pickupFromStore, token);
  }
}
