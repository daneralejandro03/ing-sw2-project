import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityModule } from 'src/city/city.module';
import { UsersModule } from 'src/user-client/user-client.module';
import { Store } from './entities/store.entity';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Store,
    ]),
    CityModule,
    UsersModule,
    AuthModule,
    HttpModule
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService, TypeOrmModule],
})
export class StoreModule { }
