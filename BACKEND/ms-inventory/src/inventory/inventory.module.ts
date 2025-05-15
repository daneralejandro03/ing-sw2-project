import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ProductModule } from 'src/product/product.module';
import { StoreModule } from 'src/store/store.module';
import { MotionModule } from 'src/motion/motion.module';

@Module({
  imports: [
    MotionModule,
    TypeOrmModule.forFeature([
      Inventory
    ]),
    ProductModule,
    StoreModule,
    MotionModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule { }
