import {
  Injectable,
  InternalServerErrorException,
  Logger,
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

  private readonly logger = new Logger(CsvService.name);

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

      const deptNames = Array.from(
        new Set(records.map(r => r.DEPARTAMENTO).filter(n => !!n))
      );
      const existingDepts = await qr.manager.find(Departament, {
        where: { name: In(deptNames) },
      });
      const deptMap = new Map(existingDepts.map(d => [d.name, d]));

      const toCreateDepts = deptNames
        .filter(name => !deptMap.has(name))
        .map(name => qr.manager.create(Departament, { name }));
      if (toCreateDepts.length) {
        const saved = await qr.manager.save(toCreateDepts);
        for (const d of saved) deptMap.set(d.name, d);
      }

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
    this.logger.log('Iniciando importación de TIENDAS desde CSV (modo: sin modificar servicios, unicidad por ID Almacén).');

    const text = buffer.toString('utf-8');
    const rows = parse(text, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Para el BOM
      // Si tus CSV de tiendas también pudieran tener comillas "relajadas", añade:
      // relax_quotes: true, 
    }) as StoreCsvRow[];
    this.logger.log(`Parseadas ${rows.length} filas del CSV de tiendas. (Alerta de memoria si es grande)`);

    let totalCreated = 0;
    let totalSkipped = 0;

    const limit = pLimit(5);
    const rowProcessingGroupSize = 50;

    const processRowGroup = async (
      rowGroup: StoreCsvRow[],
      groupNumber: number
    ): Promise<{ createdInGroup: number; skippedInGroup: number }> => {
      let createdThisGroup = 0;
      let skippedThisGroup = 0;

      for (const [indexInGroup, row] of rowGroup.entries()) {
        // this.logger.debug(`--- TIENDA DEBUG --- Grupo #${groupNumber}, Fila en Grupo ${indexInGroup + 1}`);
        // this.logger.debug(`Contenido bruto (tienda): ${JSON.stringify(row)}`);
        // this.logger.debug(`Claves presentes (tienda): ${Object.keys(row).join(', ')}`);

        const requiredFields = [
          'id_almacen', 'nombre_almacen', 'direccion', 'ciudad', 'departamento',
          'pais', 'codigo_postal', 'latitud', 'longitud', 'gerente', 'telefono',
          'email', 'capacidad_m2', 'estado',
        ];

        // (Opcional) Bucle de depuración para campos
        // for (const field of requiredFields) {
        //   if (!row[field]) {
        //     this.logger.warn(`(Debug Tienda) Campo requerido '${field}' Falsy. Valor: '${row[field]}', Tipo: ${typeof row[field]}`);
        //   }
        // }

        if (requiredFields.some(f => !row[f])) {
          this.logger.warn(`TIENDA: VALIDACIÓN FALLIDA para Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Almacén del CSV: ${row.id_almacen || 'N/A'}). Faltan campos. Omitiendo.`);
          skippedThisGroup++;
          continue;
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
          // CAMBIO: Verificar existencia por id_almacen (código) en lugar de nombre_almacen
          const already = await this.storeService.findByCode(row.id_almacen); // Asume que tienes storeService.findByCode

          if (already) {
            this.logger.warn(`TIENDA: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Almacén: ${row.id_almacen}): Ya existe un almacén con este código. Omitiendo.`);
            if (qr.isTransactionActive) await qr.rollbackTransaction();
            skippedThisGroup++;
            continue;
          }

          const dep = await this.departService.findByNameOrCreate(row.departamento);
          const city = await this.cityService.findByNameOrCreate(dep.id, row.ciudad);

          let userId: string;
          try {
            const user = await this.userClient.findByEmail(row.email, token);
            userId = user.id;
          } catch (userError) {
            this.logger.warn(`TIENDA: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (Email: ${row.email}): Usuario no encontrado. Creando... (Error original: ${userError})`);
            try {
              const roleId = await this.roleClient.ensureRole('Manager', token);
              const [first, ...rest] = row.gerente.split(' ');

              const createdUser = await this.userClient.createUserWithRole(
                roleId,
                {
                  name: first,
                  lastName: rest.join(' '),
                  gender: 'Masculino',
                  email: row.email,
                  password: 'DefaultP@ss123', // ¡¡URGENTE!! Cambiar.
                  cellPhone: parseInt(row.telefono, 10) || 3145919465,
                  landline: 0,
                  IDType: 'CC',
                  IDNumber: Math.random().toString().slice(2, 12),
                },
                token,
              );
              const userEmailData = await this.userClient.findByEmail(createdUser.user.email, token);
              userId = userEmailData.id;
            } catch (createUserError) {
              this.logger.error(`TIENDA: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (Email: ${row.email}): Error CRÍTICO creando usuario: ${createUserError}. La fila se omitirá.`);
              throw createUserError;
            }
          }

          await this.storeService.create(
            city.id,
            userId,
            {
              code: row.id_almacen, // Este es el id_almacen del CSV
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
          createdThisGroup++;
        } catch (err) {
          this.logger.error(`TIENDA: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Almacén: ${row.id_almacen || 'N/A'}): Error procesando: ${err}`);
          if (qr.isTransactionActive) {
            try {
              await qr.rollbackTransaction();
            } catch (rollbackErr) {
              this.logger.error(`TIENDA: Grupo #${groupNumber}, Fila #${indexInGroup + 1}: Error durante el rollback de QR: ${rollbackErr}`);
            }
          }
          skippedThisGroup++;
        } finally {
          if (!qr.isReleased) {
            await qr.release();
          }
        }
      }

      this.logger.log(`TIENDA: Grupo de filas #${groupNumber} completado. Creados en este grupo: ${createdThisGroup}, Omitidos en este grupo: ${skippedThisGroup}.`);
      return { createdInGroup: createdThisGroup, skippedInGroup: skippedThisGroup };
    };

    const groupsOfRows: StoreCsvRow[][] = [];
    for (let i = 0; i < rows.length; i += rowProcessingGroupSize) {
      groupsOfRows.push(rows.slice(i, i + rowProcessingGroupSize));
    }
    this.logger.log(`TIENDA: Se han creado ${groupsOfRows.length} grupos de filas para pLimit, cada grupo con hasta ${rowProcessingGroupSize} filas.`);

    const groupProcessingPromises = groupsOfRows.map((group, index) =>
      limit(() => processRowGroup(group, index + 1))
    );

    try {
      const allGroupResults = await Promise.all(groupProcessingPromises);
      for (const result of allGroupResults) {
        totalCreated += result.createdInGroup;
        totalSkipped += result.skippedInGroup;
      }
    } catch (overallError) {
      this.logger.error(`Error general inesperado durante el procesamiento de lotes de tiendas: ${overallError}`);
    }

    this.logger.log(`Importación de TIENDAS (sin modificar servicios) finalizada. Total Creados: ${totalCreated}, Total Omitidos: ${totalSkipped}.`);
    return { created: totalCreated, skipped: totalSkipped };
  }



  async importProducts(buffer: Buffer): Promise<{ created: number; skipped: number }> {
    this.logger.log('Iniciando importación de PRODUCTOS desde CSV (modo: sin modificar servicios).');
    const text = buffer.toString('utf-8');
    let rows: ProductCsvRow[];

    try {
      rows = parse(text, {
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,            // CORRECCIÓN: Para manejar el Byte Order Mark
        relax_quotes: true,   // CORRECCIÓN: Para permitir comillas dentro de campos no entrecomillados
      }) as ProductCsvRow[];
      this.logger.log(`Parseadas ${rows.length} filas del CSV de productos. (Alerta de memoria si es grande)`);
    } catch (parseError) {
      this.logger.error('Error CRÍTICO durante el parseo del CSV de productos:', parseError);
      this.logger.error(`Detalles del error de , Message: ${parseError}`);
      // Es importante detenerse aquí si el parseo falla.
      // El controlador debería capturar esta excepción.
      throw new InternalServerErrorException(`Error al parsear el CSV de productos: ${parseError}`);
    }

    let totalCreated = 0;
    let totalSkipped = 0;

    const limit = pLimit(5);
    const productProcessingGroupSize = 50; // Filas por cada grupo que maneja pLimit

    const processProductRowGroup = async (
      rowGroup: ProductCsvRow[],
      groupNumber: number
    ): Promise<{ createdInGroup: number; skippedInGroup: number }> => {
      let createdThisGroup = 0;
      let skippedThisGroup = 0;

      for (const [indexInGroup, row] of rowGroup.entries()) {
        // Logs de depuración (opcional, puedes removerlos o cambiar a verbose)
        // this.logger.debug(`--- PRODUCTO DEBUG --- Grupo #${groupNumber}, Fila #${indexInGroup + 1}`);
        // this.logger.debug(`Contenido bruto: ${JSON.stringify(row)}`);
        // this.logger.debug(`Claves: ${Object.keys(row).join(', ')}`);

        const required = [
          'id_producto', 'id_almacen', 'nombre_producto', 'categoria', 'descripcion',
          'sku', 'codigo_barras', 'precio_unitario', 'cantidad_stock', 'nivel_reorden',
          'ultima_reposicion', 'peso_kg', 'dimensiones_cm', 'es_fragil',
          'requiere_refrigeracion', 'estado'
          // 'fecha_vencimiento' y 'id_proveedor' se manejan como opcionales más abajo.
          // Si son estrictamente requeridos, añádelos aquí.
        ];

        // Bucle de depuración para campos (opcional)
        // for (const field of required) {
        //   if (!row[field] && typeof row[field] !== 'boolean') { // typeof row[field] !== 'boolean' para que false no cuente como "faltante"
        //     this.logger.warn(`(Debug Producto) Campo requerido '${field}' Falsy. Valor: '${row[field]}', Tipo: ${typeof row[field]}`);
        //   }
        // }

        if (required.some(f => !row[f] && typeof row[f] !== 'boolean')) { // `false` es un valor válido para es_fragil/requiere_refrigeracion
          this.logger.warn(`PRODUCTO: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Producto: ${row.id_producto || 'N/A'}): Faltan campos requeridos. Omitiendo.`);
          skippedThisGroup++;
          continue;
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
          const store = await this.storeService.findByCode(row.id_almacen);
          if (!store) {
            this.logger.warn(`PRODUCTO: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Prod: ${row.id_producto}): Almacén con código ${row.id_almacen} no encontrado. Omitiendo producto.`);
            if (qr.isTransactionActive) await qr.rollbackTransaction();
            skippedThisGroup++;
            continue;
          }

          const category = await this.categoryService.findByNameOrCreate(row.categoria);

          const [d, m, y] = row.ultima_reposicion.split('/');
          const dateEntry = new Date(+y, +m - 1, +d);

          let expirationDate = dateEntry; // Lógica original: por defecto es dateEntry
          if (row.fecha_vencimiento && row.fecha_vencimiento.trim() !== '') {
            const [dd, mm, yy] = row.fecha_vencimiento.split('/');
            expirationDate = new Date(+yy, +mm - 1, +dd);
          }

          const [lengthCm = 0, widthCm = 0, heightCm = 0] = row.dimensiones_cm.split('x').map(n => parseFloat(n) || 0);

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
            isFragile: String(row.es_fragil).toLowerCase() === 'true',
            requiresRefurbishment: String(row.requiere_refrigeracion).toLowerCase() === 'true', // Asumo typo, debería ser 'refrigeration'
            status: row.estado,
          });

          if (row.id_proveedor && row.id_proveedor.trim() !== '') {
            const supplier = await this.supplierService.findByNameOrCreate(row.id_proveedor);
            await this.provisionService.create(product.id, supplier.id);
          } else {
            this.logger.warn(`PRODUCTO: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Prod: ${row.id_producto}): No se proporcionó id_proveedor. No se creará provisión.`);
          }

          await this.inventoryService.create(store.id, product.id);

          await qr.commitTransaction();
          createdThisGroup++;
        } catch (err) {
          this.logger.error(`PRODUCTO: Grupo #${groupNumber}, Fila #${indexInGroup + 1} (ID Prod: ${row.id_producto || 'N/A'}): Error procesando: ${err}`);
          if (qr.isTransactionActive) {
            try {
              await qr.rollbackTransaction();
            } catch (rollbackErr) {
              this.logger.error(`PRODUCTO: Grupo #${groupNumber}, Fila #${indexInGroup + 1}: Error durante rollback de QR: ${rollbackErr}`);
            }
          }
          skippedThisGroup++;
        } finally {
          if (!qr.isReleased) {
            await qr.release();
          }
        }
      } // Fin del bucle for (const row of rowGroup)

      // this.logger.log(`PRODUCTO: Grupo #${groupNumber} completado. Creados: ${createdThisGroup}, Omitidos: ${skippedThisGroup}.`);
      return { createdInGroup: createdThisGroup, skippedInGroup: skippedThisGroup };
    }; // Fin de processProductRowGroup

    const productGroups: ProductCsvRow[][] = [];
    for (let i = 0; i < rows.length; i += productProcessingGroupSize) {
      productGroups.push(rows.slice(i, i + productProcessingGroupSize));
    }
    this.logger.log(`PRODUCTO: Creados ${productGroups.length} grupos para pLimit, hasta ${productProcessingGroupSize} filas/grupo.`);

    const productGroupPromises = productGroups.map((group, index) =>
      limit(() => processProductRowGroup(group, index + 1))
    );

    // Esperar a que todos los grupos se procesen
    // Envolver Promise.all en un try-catch general por si alguna promesa rechaza de forma inesperada
    // y no es manejada por pLimit o processProductRowGroup como se espera.
    try {
      const allProductResults = await Promise.all(productGroupPromises);
      for (const result of allProductResults) {
        totalCreated += result.createdInGroup;
        totalSkipped += result.skippedInGroup;
      }
    } catch (overallError) {
      this.logger.error(`Error general inesperado durante el procesamiento de lotes de productos: ${overallError}`);
      // Decide cómo manejar esto. Podrías querer que la función lance una excepción aquí.
      // Por ahora, los productos procesados hasta el error se contarán, y el resto no.
      // O podrías lanzar: throw new InternalServerErrorException('Fallo el procesamiento de lotes de productos.');
    }


    this.logger.log(`Importación de PRODUCTOS (sin modificar servicios) finalizada. Total Creados: ${totalCreated}, Total Omitidos: ${totalSkipped}.`);
    return { created: totalCreated, skipped: totalSkipped };
  }

}
