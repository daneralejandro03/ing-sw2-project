import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { DepartamentModule } from 'src/departament/departament.module';
import { CityModule } from 'src/city/city.module';

@Module({
  imports: [
    DepartamentModule,
    CityModule,
  ],
  controllers: [CsvController],
  providers: [CsvService],
})
export class CsvModule { }
