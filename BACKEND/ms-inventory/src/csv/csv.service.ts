import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, In, QueryRunner } from 'typeorm';
import { parse } from 'csv-parse/sync';

import { Departament } from '../departament/entities/departament.entity';
import { City } from '../city/entities/city.entity';


import { UserClientService } from '../user-client/user-client.service';
import { RoleClientService } from '../role-client/role-client.service';
import { CityService } from '../city/city.service';
import { DepartamentService } from '../departament/departament.service';
import { StoreService } from '../store/store.service';
import { CategoryService } from '../category/category.service';
import { SupplierService } from '../supplier/supplier.service';
import { ProductService } from '../product/product.service';
import { ProvisionService } from '../provision/provision.service';
import { InventoryService } from '../inventory/inventory.service';

import { CsvRow } from './interfaces/csv-row.interface';
import { StoreCsvRow } from './interfaces/store-csv-row.interface';
import { ProductCsvRow } from './interfaces/product-csv-row.interface';



@Injectable()
export class CsvService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userClient: UserClientService,
    private readonly roleClient: RoleClientService,
    private readonly departService: DepartamentService,
    private readonly cityService: CityService,
    private readonly storeService: StoreService,
    private readonly categoryService: CategoryService,
    private readonly supplierService: SupplierService,
    private readonly productService: ProductService,
    private readonly provisionService: ProvisionService,
    private readonly inventoryService: InventoryService,
  ) { }

  /**
   * 1) Crea/actualiza Departaments y Cities en batch.
   */
  async uploadDepartamentsAndCitys(buffer: Buffer): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const text = buffer.toString('utf-8');
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CsvRow[];

      // Departaments únicos
      const deptNames = Array.from(
        new Set(records.map(r => r.DEPARTAMENTO).filter(n => !!n))
      );
      const existingDepts = await qr.manager.find(Departament, {
        where: { name: In(deptNames) },
      });
      const deptMap = new Map(existingDepts.map(d => [d.name, d]));

      // Crear Departaments faltantes
      const toCreateDepts = deptNames
        .filter(name => !deptMap.has(name))
        .map(name => qr.manager.create(Departament, { name }));
      if (toCreateDepts.length) {
        const saved = await qr.manager.save(toCreateDepts);
        for (const d of saved) deptMap.set(d.name, d);
      }

      // Cities por departament
      const deptIds = Array.from(deptMap.values()).map(d => d.id);
      const existingCities = await qr.manager.find(City, {
        relations: ['departament'],
        where: { departament: { id: In(deptIds) } },
      });
      const cityMap = new Map(
        existingCities.map(c => [`${c.departament.id}:::${c.name}`, c])
      );

      const toCreateCities: City[] = [];
      for (const row of records) {
        const depName = row.DEPARTAMENTO;
        const muni = row.MUNICIPIO;
        if (!depName || !muni) continue;

        const dep = deptMap.get(depName)!;
        const key = `${dep.id}:::${muni}`;
        if (!cityMap.has(key)) {
          const city = qr.manager.create(City, {
            name: muni,
            departament: dep,
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
      throw new InternalServerErrorException('Error al procesar CSV', err as Error);
    } finally {
      await qr.release();
    }
  }

  async importStores(buffer: Buffer, token: string): Promise<{ created: number; skipped: number }> {
    const text = buffer.toString('utf-8');
    const rows = parse(text, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as StoreCsvRow[];

    let created = 0, skipped = 0;

    for (const row of rows) {
      // validación básica
      const required = [
        'id_almacen', 'nombre_almacen', 'direccion', 'ciudad',
        'departamento', 'pais', 'codigo_postal', 'latitud', 'longitud',
        'gerente', 'telefono', 'email', 'capacidad_m2', 'estado'
      ];
      if (required.some(f => !row[f])) {
        skipped++;
        continue;
      }

      const qr: QueryRunner = this.dataSource.createQueryRunner();
      await qr.connect(); await qr.startTransaction();
      try {
        // 1) aseguramos departamento (y país, si quisieras modelarlo)
        const dep = await this.departService.findByNameOrCreate(row.departamento);

        // 2) aseguramos ciudad
        const city = await this.cityService.findByNameOrCreate(dep.id, row.ciudad);

        // 3) verificamos si ya existe store con el nombre
        const already = await this.storeService.findByNameOne(row.nombre_almacen).catch(() => null);
        if (already) {
          skipped++;
          await qr.rollbackTransaction();
          continue;
        }

        // 4) buscamos o creamos usuario gerente
        let userId: string;
        try {
          console.log('Buscando usuario por email:', row.email);
          const user = await this.userClient.findByEmail(row.email, token);
          console.log('Usuario', user)
          if (!user) {
            throw new Error('Usuario no encontrado');
          }
          userId = user.id;
          console.log('Usuario encontrado:', userId);

        } catch {
          // creamos rol Manager si no existe
          const roleId = await this.roleClient.ensureRole('Manager', token);
          const [first, ...rest] = row.gerente.split(' ');
          const createdUser = await this.userClient.createUserWithRole(
            roleId,
            {
              name: first,
              lastName: rest.join(' '),
              gender: 'Masculino',
              email: row.email,
              password: 'DefaultP@ss123',
              cellPhone: 3145919465,
              landline: 0,
              IDType: 'CC',
              IDNumber: Math.random().toString().slice(2, 10),
            },
            token,
          );
          userId = createdUser.user._id;
        }

        // 5) creamos la store vía StoreService (usa su propio QueryRunner internamente)
        await this.storeService.create(
          city.id,
          userId,
          {
            code: row.id_almacen,
            name: row.nombre_almacen,
            address: row.direccion,
            postalCode: row.codigo_postal,
            longitude: parseFloat(row.longitud),
            latitude: parseFloat(row.latitud),
            capacity: parseInt(row.capacidad_m2, 10),
            state: row.estado,
          },
          token,
        );

        await qr.commitTransaction();
        created++;
      } catch (err) {
        console.error('Error al procesar fila:', row, err);
        await qr.rollbackTransaction();
        // loguear err.message
        skipped++;
      } finally {
        await qr.release();
      }
    }

    return { created, skipped };
  }

  async importProducts(buffer: Buffer): Promise<{ created: number; skipped: number }> {
    const text = buffer.toString('utf-8');
    const rows = parse(text, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as ProductCsvRow[];

    let created = 0, skipped = 0;

    for (const row of rows) {
      const required = [
        'id_producto', 'id_almacen', 'nombre_producto', 'categoria', 'descripcion',
        'sku', 'codigo_barras', 'precio_unitario', 'cantidad_stock', 'nivel_reorden',
        'ultima_reposicion', 'peso_kg', 'dimensiones_cm', 'es_fragil',
        'requiere_refrigeracion', 'estado'
      ];
      if (required.some(f => !row[f])) { skipped++; continue; }

      const qr: QueryRunner = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();

      try {
        // 1) tienda
        const store = await this.storeService.findByCode(row.id_almacen);
        if (!store) { skipped++; await qr.rollbackTransaction(); continue; }

        // 2) categoría
        const category = await this.categoryService.findByNameOrCreate(row.categoria);

        // 3) parsear dateEntry
        const [d, m, y] = row.ultima_reposicion.split('/');
        const dateEntry = new Date(+y, +m - 1, +d);

        // 4) parsear expirationDate o usar dateEntry
        let expirationDate = dateEntry;
        if (row.fecha_vencimiento) {
          const [dd, mm, yy] = row.fecha_vencimiento.split('/');
          expirationDate = new Date(+yy, +mm - 1, +dd);
        }

        // 5) crear producto
        const [lengthCm, widthCm, heightCm] = row.dimensiones_cm.split('x').map(n => parseFloat(n) || 0);
        const product = await this.productService.create(category.id, {
          name: row.nombre_producto,
          description: row.descripcion,
          sku: row.sku,
          barcode: row.codigo_barras,
          unitPrice: parseFloat(row.precio_unitario),
          stock: parseInt(row.cantidad_stock, 10),
          levelReorder: parseInt(row.nivel_reorden, 10),
          dateEntry,
          expirationDate,
          weightKg: parseFloat(row.peso_kg),
          lengthCm,
          widthCm,
          heightCm,
          isFragile: row.es_fragil.toLowerCase() === 'true',
          requiresRefurbishment: row.requiere_refrigeracion.toLowerCase() === 'true',
          status: row.estado,
        });

        // 6) supplier + provision + inventory
        const supplier = await this.supplierService.findByNameOrCreate(row.id_proveedor);
        await this.provisionService.create(product.id, supplier.id);
        await this.inventoryService.create(store.id, product.id);

        await qr.commitTransaction();
        created++;
      } catch (err) {
        console.error('Error importProducts fila:', row, err);
        await qr.rollbackTransaction();
        skipped++;
      } finally {
        await qr.release();
      }
    }

    return { created, skipped };
  }



}
