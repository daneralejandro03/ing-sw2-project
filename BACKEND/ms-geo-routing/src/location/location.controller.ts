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
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  /**
   * POST /locations/:userId
   * - Headers: Authorization: 'Bearer <token>'
   * - Body: { latitude, longitude }
   */
  @Post(':userId')
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
  async findAllByUser(
    @Param('userId') userId: string,
  ): Promise<Location[]> {
    // (Opcionalmente podrías volver a validar token/rol aquí, 
    //  pero se considera que ya se hizo al crear; depende de tu flujo)
    return this.locationService.findAllByUser(userId);
  }

  /**
   * DELETE /locations/:id
   * (Solo para pruebas o limpieza)
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locationService.remove(id);
  }
}
