import { Module } from '@nestjs/common';
import { GeoAssignmentService } from './geo-assignment.service';
import { GeoAssignmentController } from './geo-assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoAssignment } from './entities/geo-assignment.entity';
import { SegmentModule } from '../segment/segment.module';
import { AssignmentModule } from '../assignment/assignment.module';
import { RouteModule } from 'src/route/route.module';
import { HttpModule } from '@nestjs/axios';
import { AssignmentService } from 'src/assignment/assignment.service';
import { forwardRef } from '@nestjs/common';
import { LocationModule } from 'src/location/location.module';

@Module({
  controllers: [GeoAssignmentController],
  providers: [GeoAssignmentService, AssignmentService],
  imports: [
    TypeOrmModule.forFeature([GeoAssignment]),
    forwardRef(() => RouteModule),
    SegmentModule,
    AssignmentModule,
    HttpModule,
    LocationModule
  ],
  exports: [GeoAssignmentService, TypeOrmModule],
})
export class GeoAssignmentModule { }
