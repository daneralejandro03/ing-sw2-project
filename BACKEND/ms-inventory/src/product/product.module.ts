import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { Product } from './entities/product.entity';
import { ProductSubscriber } from './subscribers/product-subscriber/product-subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
    ]),
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductSubscriber],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule { }
