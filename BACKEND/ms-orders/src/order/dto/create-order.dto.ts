import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDTO {
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @IsString()
  @IsNotEmpty()
  idProduct: string;
}
