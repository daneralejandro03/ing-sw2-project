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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.remove(id);
  }
}
