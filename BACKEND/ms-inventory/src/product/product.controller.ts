import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post('category/:categoryId')
  create(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.create(categoryId, createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    const token = req.headers.authorization;;

    if (!token || !token.startsWith('Bearer ')) {
      throw new BadRequestException('Token no provisto');
    }
    return this.productService.update(id, dto, token);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
