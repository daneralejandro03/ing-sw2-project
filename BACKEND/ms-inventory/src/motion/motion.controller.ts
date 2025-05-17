import { Controller, Get, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MotionService } from './motion.service';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Motion } from './entities/motion.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';

@ApiTags('Motion')
@ApiBearerAuth()
@Controller('motion')
export class MotionController {
  constructor(private readonly motionService: MotionService) { }


  @Get()
  @ApiOperation({ summary: 'Obtener todos los movimientos' })
  @ApiResponse({ status: 200, description: 'Listado de movimientos', type: [Motion] })
  findAll() {
    return this.motionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del movimiento' })
  @ApiResponse({ status: 200, description: 'Movimiento encontrado', type: Motion })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.motionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un movimiento existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del movimiento' })
  @ApiBody({ type: UpdateMotionDto })
  @ApiResponse({ status: 200, description: 'Movimiento actualizado', type: Motion })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMotionDto: UpdateMotionDto
  ) {
    return this.motionService.update(id, updateMotionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un movimiento' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del movimiento' })
  @ApiResponse({ status: 200, description: 'Movimiento eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.motionService.remove(id);
  }
}
