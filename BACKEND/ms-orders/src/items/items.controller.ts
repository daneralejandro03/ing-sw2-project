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
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Item } from './entities/item.entity';

@ApiTags('Item')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo item' })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({ status: 201, description: 'item creado', type: Item })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los items' })
  @ApiResponse({
    status: 200,
    description: 'Listado de items',
    type: [Item],
  })
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del item' })
  @ApiResponse({ status: 200, description: 'item encontrado', type: Item })
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un item existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID del item' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({
    status: 200,
    description: 'item actualizado',
    type: Item,
  })
  update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(id, updateItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un item' })
  @ApiParam({ name: 'id', type: String, description: 'ID del item' })
  @ApiResponse({ status: 200, description: 'item eliminado' })  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }

}
