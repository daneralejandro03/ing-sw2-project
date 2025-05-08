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
      }),
    }),

    DepartamentModule,

    CityModule,

    AuthModule,

    UsersModule,

    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
