import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { parse } from 'csv-parse/sync';

import { Departament } from '../departament/entities/departament.entity';
import { City } from '../city/entities/city.entity';
import pLimit from '@common.js/p-limit';

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

    let created = 0;
    let skipped = 0;

    const limit = pLimit(5); // máximo 5 batches paralelos (ajustable)
    const batchSize = 50;    // tamaño de cada batch (ajustable)

    // Procesar cada batch secuencialmente fila a fila (tu lógica intacta)
    const processBatch = async (batch: StoreCsvRow[]) => {
      for (const row of batch) {
        const required = [
          'id_almacen', 'nombre_almacen', 'direccion', 'ciudad', 'departamento',
          'pais', 'codigo_postal', 'latitud', 'longitud', 'gerente', 'telefono',
          'email', 'capacidad_m2', 'estado',
        ];
        if (required.some(f => !row[f])) {
          skipped++;
          continue;
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
          const dep = await this.departService.findByNameOrCreate(row.departamento);
          const city = await this.cityService.findByNameOrCreate(dep.id, row.ciudad);

          const already = await this.storeService.findByNameOne(row.nombre_almacen).catch(() => null);
          if (already) {
            skipped++;
            await qr.rollbackTransaction();
            continue;
          }

          let userId: string;
          try {
            console.log('Buscando usuario por email:', row.email);
            const user = await this.userClient.findByEmail(row.email, token);
            userId = user.id;
            console.log('Usuario encontrado:', userId);
          } catch {
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
            const userEmail = await this.userClient.findByEmail(createdUser.user.email, token);
            userId = userEmail.id;
            console.log('Usuario creado:', userId);
          }

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
          skipped++;
        } finally {
          await qr.release();
        }
      }
    };

    // Divide en batches
    const batches: StoreCsvRow[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }

    // Ejecuta batches en paralelo con límite de concurrencia
    await Promise.all(
      batches.map(batch => limit(() => processBatch(batch)))
    );

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

    let created = 0;
    let skipped = 0;

    const limit = pLimit(5);   // límite de batches paralelos (ajustable)
    const batchSize = 50;      // tamaño de cada batch (ajustable)

    // Función para procesar un batch fila a fila secuencialmente
    const processBatch = async (batch: ProductCsvRow[]) => {
      for (const row of batch) {
        const required = [
          'id_producto', 'id_almacen', 'nombre_producto', 'categoria', 'descripcion',
          'sku', 'codigo_barras', 'precio_unitario', 'cantidad_stock', 'nivel_reorden',
          'ultima_reposicion', 'peso_kg', 'dimensiones_cm', 'es_fragil',
          'requiere_refrigeracion', 'estado'
        ];
        if (required.some(f => !row[f])) {
          skipped++;
          continue;
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
          const store = await this.storeService.findByCode(row.id_almacen);
          if (!store) {
            skipped++;
            await qr.rollbackTransaction();
            continue;
          }

          const category = await this.categoryService.findByNameOrCreate(row.categoria);

          const [d, m, y] = row.ultima_reposicion.split('/');
          const dateEntry = new Date(+y, +m - 1, +d);

          let expirationDate = dateEntry;
          if (row.fecha_vencimiento) {
            const [dd, mm, yy] = row.fecha_vencimiento.split('/');
            expirationDate = new Date(+yy, +mm - 1, +dd);
          }

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
    };

    // Dividir las filas en batches
    const batches: ProductCsvRow[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }

    // Ejecutar batches en paralelo con límite de concurrencia
    await Promise.all(
      batches.map(batch => limit(() => processBatch(batch)))
    );

    return { created, skipped };
  }



}
