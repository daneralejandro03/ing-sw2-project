import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SegmentService } from './segment.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { Segment } from './entities/segment.entity';

// Decoradores de Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Segments')
@Controller()
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) { }

  /**
   * POST /routes/:routeId/segments
   * -- Crea un nuevo segmento para la ruta indicada por routeId
   * -- Body: { sequence, latitude, longitude }
   */
  @Post('routes/:routeId/segments')
  @ApiBearerAuth('JWT-auth')              // indica que aquí se envía Bearer <token>
  @UseGuards(JwtAuthGuard)                // (opcional) si usas guardia para validar el JWT
  @ApiOperation({ summary: 'Crear un nuevo segmento en una ruta existente' })
  @ApiParam({
    name: 'routeId',
    description: 'ID numérico de la ruta a la que pertenece el segmento',
    type: Number,
    example: 123,
  })
  @ApiBody({ type: CreateSegmentDto })
  @ApiResponse({
    status: 201,
    description: 'Segmento creado satisfactoriamente.',
    type: Segment,
  })
  @ApiResponse({ status: 400, description: 'Datos del segmento inválidos.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async create(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Body() createDto: CreateSegmentDto,
  ): Promise<Segment> {
    return this.segmentService.create(routeId, createDto);
  }

  /**
   * GET /routes/:routeId/segments
   * -- Devuelve todos los segmentos de la ruta routeId
   */
  @Get('routes/:routeId/segments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los segmentos de una ruta' })
  @ApiParam({
    name: 'routeId',
    description: 'ID numérico de la ruta',
    type: Number,
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de segmentos encontrado.',
    type: Segment,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async findByRoute(
    @Param('routeId', ParseIntPipe) routeId: number,
  ): Promise<Segment[]> {
    return this.segmentService.findByRoute(routeId);
  }

  /**
   * GET /segments/:id
   * -- Devuelve un segmento por su ID
   */
  @Get('segments/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener un segmento por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del segmento',
    type: Number,
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Segmento encontrado.',
    type: Segment,
  })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Segmento no encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Segment> {
    return this.segmentService.findOne(id);
  }

  /**
   * PATCH /segments/:id
   * -- Actualiza un segmento por su ID
   * -- Body: puede contener { sequence?, latitude?, longitude? }
   */
  @Patch('segments/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar un segmento existente' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del segmento a actualizar',
    type: Number,
    example: 42,
  })
  @ApiBody({ type: UpdateSegmentDto })
  @ApiResponse({
    status: 200,
    description: 'Segmento actualizado correctamente.',
    type: Segment,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos para actualización.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Segmento no encontrado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSegmentDto,
  ): Promise<Segment> {
    return this.segmentService.update(id, updateDto);
  }

  /**
   * DELETE /segments/:id
   * -- Elimina un segmento por su ID
   */
  @Delete('segments/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar un segmento por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del segmento a eliminar',
    type: Number,
    example: 42,
  })
  @ApiResponse({ status: 204, description: 'Segmento eliminado correctamente.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Segmento no encontrado.' })
  async removeOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.segmentService.removeOne(id);
  }

  /**
   * DELETE /routes/:routeId/segments
   * -- Elimina todos los segmentos de la ruta indicada
   */
  @Delete('routes/:routeId/segments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar todos los segmentos de una ruta' })
  @ApiParam({
    name: 'routeId',
    description: 'ID numérico de la ruta cuyos segmentos se eliminarán',
    type: Number,
    example: 123,
  })
  @ApiResponse({ status: 204, description: 'Segmentos eliminados correctamente.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada.' })
  async removeByRoute(
    @Param('routeId', ParseIntPipe) routeId: number,
  ): Promise<void> {
    return this.segmentService.removeByRoute(routeId);
  }
}
