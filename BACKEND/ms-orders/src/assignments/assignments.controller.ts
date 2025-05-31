import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Assignment } from './entities/assignment.entity';

@ApiTags('Assignment')
@ApiBearerAuth()
@Controller('assignment')
export class AssignmentsController {
  constructor(private readonly assignmentService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo assignment' })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiResponse({ status: 201, description: 'assignment creado', type: Assignment })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los assignments' })
  @ApiResponse({
    status: 200,
    description: 'Listado de assignments',
    type: [Assignment],
  })
  findAll() {
    return this.assignmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un assignment por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del assignment' })
  @ApiResponse({ status: 200, description: 'assignment encontrado', type: Assignment })
  findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un assignment existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID del assignment' })
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiResponse({
    status: 200,
    description: 'assignment actualizado',
    type: Assignment,
  })
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un assignment' })
  @ApiParam({ name: 'id', type: String, description: 'ID del assignment' })
  @ApiResponse({ status: 200, description: 'assignment eliminado' })  remove(@Param('id') id: string) {
    return this.assignmentService.remove(id);
  }

}
