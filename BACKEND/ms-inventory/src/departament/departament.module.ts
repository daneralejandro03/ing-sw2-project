import { Module } from '@nestjs/common';
import { DepartamentService } from './departament.service';
import { DepartamentController } from './departament.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departament } from './entities/departament.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Departament]),
  ],
  controllers: [DepartamentController],
  providers: [DepartamentService],
  exports: [DepartamentService, TypeOrmModule],
})
export class DepartamentModule { }


