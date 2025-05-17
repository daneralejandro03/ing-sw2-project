import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartamentService } from './departament.service';
import { CreateDepartamentDto } from './dto/create-departament.dto';
import { UpdateDepartamentDto } from './dto/update-departament.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { Departament } from './entities/departament.entity';

@ApiTags('Departament')
@ApiBearerAuth()
@Controller('departament')
export class DepartamentController {
  constructor(private readonly departamentService: DepartamentService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiBody({ type: CreateDepartamentDto })
  @ApiResponse({ status: 201, description: 'Departamento creado', type: Departament })
  create(@Body() createDepartamentDto: CreateDepartamentDto) {
    return this.departamentService.create(createDepartamentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  @ApiResponse({ status: 200, description: 'Listado de departamentos', type: [Departament] })
  findAll() {
    return this.departamentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Departamento encontrado', type: Departament })
  findOne(@Param('id') id: string) {
    return this.departamentService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un departamento existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del departamento' })
  @ApiBody({ type: UpdateDepartamentDto })
  @ApiResponse({ status: 200, description: 'Departamento actualizado', type: Departament })
  update(
    @Param('id') id: string,
    @Body() updateDepartamentDto: UpdateDepartamentDto
  ) {
    return this.departamentService.update(+id, updateDepartamentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un departamento' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del departamento' })
  @ApiResponse({ status: 200, description: 'Departamento eliminado' })
  remove(@Param('id') id: string) {
    return this.departamentService.remove(+id);
  }
}
