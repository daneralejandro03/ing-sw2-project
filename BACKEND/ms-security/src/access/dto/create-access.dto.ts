import { IsString, IsNotEmpty } from 'class-validator';


export class CreateAccessDto {

    @IsString()
    @IsNotEmpty()
    readonly role: string;

    @IsString()
    @IsNotEmpty()
    readonly permission: string;
}
