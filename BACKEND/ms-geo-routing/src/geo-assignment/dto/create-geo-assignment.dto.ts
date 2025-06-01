import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGeoAssignmentDto {
  @ApiProperty({
    description: 'ID de la asignación (UUID)',
    example: '750a42ef-5214-4902-9c65-1d196beb3411',
  })
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;
}
