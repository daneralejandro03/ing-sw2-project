import {
  Controller,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  Post,
  BadRequestException
} from '@nestjs/common';
import { StoreService } from './store.service';
import { Request } from 'express';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTokenDto } from '../user-client/dto/user-token.dto';
import { Store } from './entities/store.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';

@ApiTags('Store')
@ApiBearerAuth()
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @UseGuards(JwtAuthGuard)
  @Post('city/:cityId/user/:userId')
  @ApiOperation({ summary: 'Crear una nueva tienda' })
  @ApiParam({ name: 'cityId', type: Number, description: 'ID de la ciudad' })
  @ApiParam({ name: 'userId', type: String, description: 'ID del usuario' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: 201, description: 'Tienda creada', type: Store })
  create(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Param('userId') userId: string,
    @Body() dto: CreateStoreDto,
    @Req() req: Request
  ): Promise<Store> {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
      throw new BadRequestException('Token no provisto');
    }

    return this.storeService.create(cityId, userId, dto, token);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tiendas' })
  @ApiResponse({ status: 200, description: 'Listado de tiendas', type: [Store] })
  findAll() {
    return this.storeService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  @ApiOperation({ summary: 'Obtener usuarios asociados a tiendas' })
  @ApiResponse({ status: 200, description: 'Listado de usuarios', type: [UserTokenDto] })
  findAllUsers(@Req() req: Request): Promise<UserTokenDto[]> {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
      throw new BadRequestException('Token no provisto');
    }
    return this.storeService.findAllUsers(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tienda por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Tienda encontrada', type: Store })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tienda existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tienda' })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({ status: 200, description: 'Tienda actualizada', type: Store })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto
  ) {
    return this.storeService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tienda' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Tienda eliminada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new BadRequestException('Token no provisto');
    }
    const token = auth.slice(7);
    await this.storeService.remove(id, token);
    return { message: `Store #${id} eliminada correctamente` };
  }
}
