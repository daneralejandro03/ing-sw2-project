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

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateStoreDto, @Req() req: Request) {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      throw new Error('Token no provisto');
    }
    return this.storeService.create(dto, token);
  }

  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  findAllUsers(@Req() req: Request): Promise<UserTokenDto[]> {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
      throw new Error('Token no provisto');
    }
    return this.storeService.findAllUsers(token);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storeService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
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
