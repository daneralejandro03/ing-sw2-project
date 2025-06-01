import { Module } from '@nestjs/common';
import { RoleClientService } from './role-client.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [RoleClientService],
  exports: [RoleClientService],
})
export class RoleClientModule { }
