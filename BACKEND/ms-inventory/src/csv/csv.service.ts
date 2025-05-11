import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { Departament } from '../departament/entities/departament.entity';
import { City } from '../city/entities/city.entity';
import { parse } from 'csv-parse/sync';
import { CsvRow } from './interfaces/csv-row.interface';

@Injectable()
export class CsvService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) { }

  async uploadDepartamentsAndCitys(buffer: Buffer): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const text = buffer.toString('utf-8');
      const records: CsvRow[] = parse(text, {
        columns: true,
        skip_empty_lines: true,
      }) as CsvRow[];

      for (const row of records) {
        const deptName = row.DEPARTAMENTO.trim();
        let departament = await queryRunner.manager.findOne(Departament, {
          where: { name: deptName },
        });
        if (!departament) {
          departament = queryRunner.manager.create(Departament, { name: deptName });
          await queryRunner.manager.save(departament);
        }

        const cityName = row.MUNICIPIO.trim();
        let city = await queryRunner.manager.findOne(City, {
          where: { name: cityName, departament: { id: departament.id } },
        });
        if (!city) {
          city = queryRunner.manager.create(City, {
            name: cityName,
            departament,
          });
          await queryRunner.manager.save(city);
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al procesar CSV', err);
    } finally {
      await queryRunner.release();
    }
  }
}
