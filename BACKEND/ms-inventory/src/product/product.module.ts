import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { Product } from './entities/product.entity';
import { AlertService } from './alert.service';
import { EmailModule } from 'src/email/email.module';
import { UsersModule } from 'src/user-client/user-client.module';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { RoleClientModule } from 'src/role-client/role-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
    ]),
    CategoryModule,
    EmailModule,
    UsersModule,
    AuthModule,
    HttpModule,
    RoleClientModule
  ],
  controllers: [ProductController],
  providers: [ProductService, AlertService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule { }
