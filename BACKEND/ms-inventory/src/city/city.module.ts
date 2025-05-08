import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { DepartamentModule } from 'src/departament/departament.module';


@Module({
  imports: [
    DepartamentModule,
    TypeOrmModule.forFeature([City]),
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService, TypeOrmModule],
})
export class CityModule { }
