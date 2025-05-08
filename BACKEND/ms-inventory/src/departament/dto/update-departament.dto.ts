import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartamentDto } from './create-departament.dto';

export class UpdateDepartamentDto extends PartialType(CreateDepartamentDto) {}
