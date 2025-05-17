import { Module } from '@nestjs/common';
import { ProvisionService } from './provision.service';
import { ProvisionController } from './provision.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provision } from './entities/provision.entity';
import { ProductModule } from 'src/product/product.module';
import { SupplierModule } from 'src/supplier/supplier.module';
import { HttpModule } from '@nestjs/axios';
import { RoleClientModule } from 'src/role-client/role-client.module';
import { AuthModule } from 'src/auth/auth.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provision
    ]),
    ProductModule,
    SupplierModule,
    HttpModule,
    RoleClientModule,
    AuthModule
  ],
  controllers: [ProvisionController],
  providers: [ProvisionService],
  exports: [ProvisionService, TypeOrmModule],
})
export class ProvisionModule { }
