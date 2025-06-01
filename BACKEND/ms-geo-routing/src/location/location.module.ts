import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Location } from './entities/location.entity';
import { UsersModule } from '../user-client/user-client.module'
import { RoleClientModule } from 'src/role-client/role-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    HttpModule,
    ConfigModule,
    UsersModule,
    RoleClientModule
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService, TypeOrmModule],
})
export class LocationModule { }
