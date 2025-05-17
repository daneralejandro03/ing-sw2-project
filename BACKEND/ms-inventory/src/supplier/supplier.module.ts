import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { HttpModule } from '@nestjs/axios';
import { RoleClientModule } from 'src/role-client/role-client.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier
    ]),
    HttpModule,
    RoleClientModule
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService, TypeOrmModule],
})
export class SupplierModule { }
