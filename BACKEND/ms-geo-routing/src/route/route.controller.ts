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
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Route } from './entities/route.entity';

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
  async create(
    @Param('geoAssignmentId', ParseIntPipe) geoAssignmentId: number,
    @Body() createDto: CreateRouteDto,
    @Headers('authorization') authHeader: string,
  ): Promise<Route> {
    // 1) Validar que venga el header Authorization y comience con "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto o sin formato válido');
    }
    const token = authHeader.slice(7);

    // 2) Llamar al servicio pasando geoAssignmentId, createDto y token
    return this.routeService.create(geoAssignmentId, createDto, token);
  }

  /**
   * GET /routes
   * - Devuelve todas las rutas.
   */
  @Get()
  async findAll(): Promise<Route[]> {
    return this.routeService.findAll();
  }

  /**
   * GET /routes/:id
   * - Devuelve la ruta específica por routeId.
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Route> {
    return this.routeService.findOne(id);
  }

  /**
   * PATCH /routes/:id
   * - Actualiza campos permitidos de la ruta.
   */
  @Patch(':id')
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
