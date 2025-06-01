import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGeoAssignmentDto {
    @ApiPropertyOptional({
        description: 'Nueva distancia del repartidor al almacén (en metros)',
        example: 1200,
    })
    @IsNumber()
    @IsOptional()
    distanceToPickup?: number;

    @ApiPropertyOptional({
        description: 'Nueva distancia del almacén al cliente (en metros)',
        example: 3500,
    })
    @IsNumber()
    @IsOptional()
    distanceToDrop?: number;
}
