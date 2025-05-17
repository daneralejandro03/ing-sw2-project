import { Module } from '@nestjs/common';
import { DepartamentService } from './departament.service';
import { DepartamentController } from './departament.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departament } from './entities/departament.entity';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    TypeOrmModule.forFeature([Departament]),
    AuthModule,
    HttpModule,
  ],
  controllers: [DepartamentController],
  providers: [DepartamentService],
  exports: [DepartamentService, TypeOrmModule],
})
export class DepartamentModule { }


