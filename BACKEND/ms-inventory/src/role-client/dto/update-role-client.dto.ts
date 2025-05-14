import { PartialType } from '@nestjs/swagger';
import { CreateRoleClientDto } from './create-role-client.dto';

export class UpdateRoleClientDto extends PartialType(CreateRoleClientDto) {}
