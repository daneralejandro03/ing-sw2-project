import { IsNumber, IsInt, IsNotEmpty } from 'class-validator';

export class CreateRouteDto {
    @IsNumber()
    @IsNotEmpty()
    destinationLat: number;

    @IsNumber()
    @IsNotEmpty()
    destinationLng: number;

    @IsInt()
    @IsNotEmpty()
    pickupFromStore: number;
}
