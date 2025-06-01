import { IsString, IsNotEmpty, IsEmail, IsBoolean } from 'class-validator';

export class UserTokenDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsBoolean()
    @IsNotEmpty()
    estado: boolean;

    @IsString()
    @IsNotEmpty()
    role: string;
}
