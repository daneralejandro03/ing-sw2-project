import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';

@ApiTags('City')
@ApiBearerAuth()
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @UseGuards(JwtAuthGuard)
  @Post('departament/:departamentId')
  @ApiOperation({ summary: 'Crear una nueva ciudad en un departamento' })
  @ApiParam({ name: 'departamentId', type: Number, description: 'ID del departamento' })
  @ApiBody({ type: CreateCityDto })
  @ApiResponse({ status: 201, description: 'Ciudad creada', type: City })
  create(
    @Param('departamentId', ParseIntPipe) departamentId: number,
    @Body() createCityDto: CreateCityDto,
  ): Promise<City> {
    return this.cityService.create(departamentId, createCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ciudades' })
  @ApiResponse({ status: 200, description: 'Listado de ciudades', type: [City] })
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ciudad por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ciudad' })
  @ApiResponse({ status: 200, description: 'Ciudad encontrada', type: City })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ciudad existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ciudad' })
  @ApiBody({ type: UpdateCityDto })
  @ApiResponse({ status: 200, description: 'Ciudad actualizada', type: City })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.cityService.update(id, updateCityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ciudad' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ciudad' })
  @ApiResponse({ status: 200, description: 'Ciudad eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.remove(id);
  }

  @Get('departament/:departamentId')
  @ApiOperation({ summary: 'Obtener ciudades por departamento' })
  @ApiParam({ name: 'departamentId', type: Number, description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Listado de ciudades por departamento', type: [City] })
  findByDepartament(
    @Param('departamentId', ParseIntPipe) departamentId: number,
  ) {
    return this.cityService.findByDepartament(departamentId);
  }
}
