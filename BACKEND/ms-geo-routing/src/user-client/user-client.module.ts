import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserClientService } from './user-client.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UsersModule { }
