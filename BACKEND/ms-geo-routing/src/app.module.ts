import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user-client/user-client.module';
import { RoleClientModule } from './role-client/role-client.module';
import { AssignmentModule } from './assignment/assignment.module';
import { GeoAssignmentModule } from './geo-assignment/geo-assignment.module';
import { RouteModule } from './route/route.module';
import { SegmentModule } from './segment/segment.module';
import { LocationModule } from './location/location.module';


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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    AuthModule,

    UsersModule,

    RoleClientModule,

    AssignmentModule,

    GeoAssignmentModule,

    RouteModule,

    SegmentModule,

    LocationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
