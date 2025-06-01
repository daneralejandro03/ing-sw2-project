import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AssignmentService],
  imports: [HttpModule, ConfigModule],
  exports: [AssignmentService, HttpModule, ConfigModule],
})
export class AssignmentModule { }
