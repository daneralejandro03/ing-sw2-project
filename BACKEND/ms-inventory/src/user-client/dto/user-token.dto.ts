import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class UserTokenDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    role: string;
}
