import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { DepartamentModule } from 'src/departament/departament.module';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    DepartamentModule,
    AuthModule,
    HttpModule,
    TypeOrmModule.forFeature([City]),
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService, TypeOrmModule],
})
export class CityModule { }
