import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { DepartamentModule } from 'src/departament/departament.module';
import { CityModule } from 'src/city/city.module';
import { StoreModule } from 'src/store/store.module';
import { CategoryModule } from 'src/category/category.module';
import { SupplierModule } from 'src/supplier/supplier.module';
import { ProductModule } from 'src/product/product.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { ProvisionModule } from 'src/provision/provision.module';
import { UsersModule } from 'src/user-client/user-client.module';
import { RoleClientModule } from 'src/role-client/role-client.module';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    DepartamentModule,
    CityModule,
    StoreModule,
    CategoryModule,
    SupplierModule,
    ProductModule,
    InventoryModule,
    ProvisionModule,
    UsersModule,
    RoleClientModule,
    AuthModule,
    HttpModule,

  ],
  controllers: [CsvController],
  providers: [CsvService],
})
export class CsvModule { }
