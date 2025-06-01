import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
