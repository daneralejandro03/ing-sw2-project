import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, In } from 'typeorm';
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
    const qr: QueryRunner = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const text = buffer.toString('utf-8');
      const records: CsvRow[] = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CsvRow[];

      const deptNames = Array.from(new Set(records.map(r => r.DEPARTAMENTO)));
      const existingDepts = await qr.manager.find(Departament, {
        where: { name: In(deptNames) },
      });
      const deptMap = new Map<string, Departament>(
        existingDepts.map(d => [d.name, d]),
      );

      const toCreateDepts = deptNames
        .filter(name => !deptMap.has(name))
        .map(name => qr.manager.create(Departament, { name }));

      if (toCreateDepts.length) {
        const savedDepts = await qr.manager.save(toCreateDepts);
        for (const d of savedDepts) {
          deptMap.set(d.name, d);
        }
      }

      const deptIds = Array.from(deptMap.values()).map(d => d.id);
      const existingCities = await qr.manager.find(City, {
        relations: ['departament'],
        where: { departament: { id: In(deptIds) } },
      });
      const cityMap = new Map<string, City>();
      for (const c of existingCities) {
        cityMap.set(`${c.departament.id}:::${c.name}`, c);
      }

      const toCreateCities: City[] = [];
      for (const row of records) {
        const dept = deptMap.get(row.DEPARTAMENTO)!;
        const key = `${dept.id}:::${row.MUNICIPIO}`;
        if (!cityMap.has(key)) {
          const city = qr.manager.create(City, {
            name: row.MUNICIPIO,
            departament: dept,
          });
          toCreateCities.push(city);
          cityMap.set(key, city);
        }
      }

      if (toCreateCities.length) {
        await qr.manager.save(toCreateCities);
      }

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw new InternalServerErrorException('Error al procesar CSV', err);
    } finally {
      await qr.release();
    }
  }
}
