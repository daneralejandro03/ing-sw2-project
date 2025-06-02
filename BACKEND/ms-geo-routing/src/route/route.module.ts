import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GeoAssignmentModule } from 'src/geo-assignment/geo-assignment.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route]),
    HttpModule,
    ConfigModule,
    forwardRef(() => GeoAssignmentModule),
    AuthModule
  ],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService, TypeOrmModule],
})
export class RouteModule { }
