import { PartialType } from '@nestjs/swagger';
import { CreateCsvDto } from './create-csv.dto';

export class UpdateCsvDto extends PartialType(CreateCsvDto) { }
