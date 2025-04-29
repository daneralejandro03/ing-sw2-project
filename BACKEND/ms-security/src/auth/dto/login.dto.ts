import { IsEmail, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class LoginDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsIn(['email', 'sms'])
    twoFactorMethod?: 'email' | 'sms';
}