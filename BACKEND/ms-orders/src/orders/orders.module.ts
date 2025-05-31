import { Module } from '@nestjs/common';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { Item } from 'src/items/entities/item.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Item, Assignment]), AuthModule, HttpModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrdersModule {}
