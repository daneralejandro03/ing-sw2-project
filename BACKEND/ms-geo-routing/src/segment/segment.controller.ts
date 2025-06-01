import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SegmentService } from './segment.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { Segment } from './entities/segment.entity';

@Controller()
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) { }

  /**
   * POST /routes/:routeId/segments
   * -- Crea un nuevo segmento para la ruta indicada por routeId
   * -- Body: { sequence, latitude, longitude }
   */
  @Post('routes/:routeId/segments')
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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Segment> {
    return this.segmentService.findOne(id);
  }

  /**
   * PATCH /segments/:id
   * -- Actualiza un segmento por su ID
   * -- Body: puede contener { sequence?, latitude?, longitude? }
   */
  @Patch('segments/:id')
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
  async removeOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.segmentService.removeOne(id);
  }

  /**
   * DELETE /routes/:routeId/segments
   * -- Elimina todos los segmentos de la ruta indicada
   */
  @Delete('routes/:routeId/segments')
  async removeByRoute(
    @Param('routeId', ParseIntPipe) routeId: number,
  ): Promise<void> {
    return this.segmentService.removeByRoute(routeId);
  }
}
