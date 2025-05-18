import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './common/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private extractToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    if (!authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token mal formado');
    }
    return authorization.slice(7); 
  }

  @Post()
  @Roles('Administrator', 'Manager')
  async create(@Body() dto: CreateOrderDTO, @Req() req: AuthenticatedRequest) {
    const token = this.extractToken(req.headers.authorization);
    return this.orderService.create(dto, req.user.id, token);
  }

  @Get()
  @Roles('Administrator', 'Manager')
  async list(@Req() req: AuthenticatedRequest) {
    const token = this.extractToken(req.headers.authorization);
    return this.orderService.list(token);
  }

  @Get(':id')
  @Roles('Administrator', 'Manager')
  async get(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const token = this.extractToken(req.headers.authorization);
    return this.orderService.get(id, token);
  }

  @Patch(':id')
  @Roles('Administrator', 'Manager')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDTO,
    @Req() req: AuthenticatedRequest,
  ) {
    const token = this.extractToken(req.headers.authorization);
    return this.orderService.update(id, dto, req.user.id, token);
  }

  @Delete(':id')
  @Roles('Administrator')
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const token = this.extractToken(req.headers.authorization);
    return this.orderService.delete(id, req.user.id, token);
  }
}
