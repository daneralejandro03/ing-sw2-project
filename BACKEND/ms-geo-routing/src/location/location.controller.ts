import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Headers,
  ParseIntPipe,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  /**
   * POST /locations/:userId
   * - Headers: Authorization: 'Bearer <token>'
   * - Body: { latitude, longitude }
   */
  @Post(':userId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Registrar nueva ubicación para un repartidor' })
  @ApiParam({
    name: 'userId',
    description: 'ID del repartidor (string)',
    type: String,
    example: '682768793da0d21f75167e24',
  })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'Ubicación creada correctamente.',
    type: Location,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear ubicación.' })
  @ApiResponse({ status: 401, description: 'Token no provisto o inválido.' })
  async create(
    @Param('userId') userId: string,
    @Body() createDto: CreateLocationDto,
    @Headers('authorization') authHeader: string,
  ): Promise<Location> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto');
    }
    const token = authHeader.slice(7);
    return this.locationService.create(userId, token, createDto);
  }

  /**
   * GET /locations/:userId
   * Devuelve todas las ubicaciones registradas por el repartidor.
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Obtener todas las ubicaciones de un repartidor' })
  @ApiParam({
    name: 'userId',
    description: 'ID del repartidor (string)',
    type: String,
    example: '682768793da0d21f75167e24',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de ubicaciones retornado.',
    type: Location,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Repartidor no encontrado o sin ubicaciones.' })
  async findAllByUser(
    @Param('userId') userId: string,
  ): Promise<Location[]> {
    return this.locationService.findAllByUser(userId);
  }

  /**
   * DELETE /locations/:id
   * (Solo para pruebas o limpieza)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ubicación por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la ubicación a eliminar',
    type: Number,
    example: 7,
  })
  @ApiResponse({ status: 204, description: 'Ubicación eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locationService.remove(id);
  }
}
