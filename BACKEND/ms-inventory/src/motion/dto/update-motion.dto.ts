import { PartialType } from '@nestjs/swagger';
import { CreateMotionDto } from './create-motion.dto';

export class UpdateMotionDto extends PartialType(CreateMotionDto) {}
