import { Module } from '@nestjs/common';
import { MotionService } from './motion.service';
import { MotionController } from './motion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motion } from './entities/motion.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Motion, Inventory]),
    AuthModule,
    HttpModule,
  ],
  controllers: [MotionController],
  providers: [MotionService],
  exports: [TypeOrmModule, MotionService],
})
export class MotionModule { }
