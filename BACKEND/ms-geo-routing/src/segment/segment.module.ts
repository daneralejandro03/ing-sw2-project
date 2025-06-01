import { Module } from '@nestjs/common';
import { SegmentService } from './segment.service';
import { SegmentController } from './segment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Segment } from './entities/segment.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RouteModule } from 'src/route/route.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Segment]),
    HttpModule,
    ConfigModule,
    RouteModule,
  ],
  controllers: [SegmentController],
  providers: [SegmentService],
  exports: [SegmentService, TypeOrmModule],
})
export class SegmentModule { }
