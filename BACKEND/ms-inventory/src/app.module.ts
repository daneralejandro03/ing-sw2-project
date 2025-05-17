import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartamentModule } from './departament/departament.module';
import { CityModule } from './city/city.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user-client/user-client.module';
import { StoreModule } from './store/store.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ProvisionModule } from './provision/provision.module';
import { SupplierModule } from './supplier/supplier.module';
import { CsvModule } from './csv/csv.module';
import { RoleClientModule } from './role-client/role-client.module';
import { MotionModule } from './motion/motion.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        connectTimeout: 60000,
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          idleTimeout: 30000,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        },
      }),
    }),

    DepartamentModule,

    CityModule,

    AuthModule,

    UsersModule,

    StoreModule,

    InventoryModule,

    ProductModule,

    CategoryModule,

    ProvisionModule,

    SupplierModule,

    CsvModule,

    RoleClientModule,

    MotionModule,

    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
