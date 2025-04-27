import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsNumber, IsOptional, IsDate, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    secondName?: string;

    @IsString()
    @IsNotEmpty()
    firstLastName: string;

    @IsString()
    @IsOptional()
    secondLastName?: string;

    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsNumber()
    @IsNotEmpty()
    cellPhone: number;

    @IsNumber()
    @IsOptional()
    landline?: number;

    @IsString()
    @IsNotEmpty()
    IDType: string;

    @IsString()
    @IsNotEmpty()
    IDNumber: string;

    // Campos opcionales para verificación y 2FA
    @IsString()
    @IsOptional()
    verificationCode?: string;

    @IsDate()
    @IsOptional()
    verificationCodeExpires?: Date;

    @IsString()
    @IsOptional()
    twoFactorCode?: string;

    @IsDate()
    @IsOptional()
    twoFactorCodeExpires?: Date;

    @IsBoolean()
    @IsOptional()
    requiresTwoFactor?: boolean;

    @IsString()
    @IsNotEmpty()
    readonly roleId: string;
}
