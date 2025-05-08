import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateDepartamentDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    name: string;

}
