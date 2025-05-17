import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductModule } from 'src/product/product.module';
import { StoreModule } from 'src/store/store.module';
import { MotionModule } from 'src/motion/motion.module';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MotionModule,
    TypeOrmModule.forFeature([
      Inventory
    ]),
    ProductModule,
    StoreModule,
    MotionModule,
    AuthModule,
    HttpModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule { }
