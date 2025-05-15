import { Module } from '@nestjs/common';
import { MotionService } from './motion.service';
import { MotionController } from './motion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motion } from './entities/motion.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Motion, Inventory])
  ],
  controllers: [MotionController],
  providers: [MotionService],
  exports: [TypeOrmModule, MotionService],
})
export class MotionModule { }
