import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { ItemsModule } from './items/items.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { Order } from './orders/entities/order.entity';
import { Item } from './items/entities/item.entity';
import { Assignment } from './assignments/entities/assignment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Order, Item, Assignment],
        synchronize: true,
      }),
    }),
    OrdersModule,
    ItemsModule,
    AssignmentsModule,
  ],
})
export class AppModule {}
