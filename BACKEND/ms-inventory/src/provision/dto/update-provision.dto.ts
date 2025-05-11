import { PartialType } from '@nestjs/swagger';
import { CreateProvisionDto } from './create-provision.dto';

export class UpdateProvisionDto extends PartialType(CreateProvisionDto) {}
