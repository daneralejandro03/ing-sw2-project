import {
    IsString, IsNotEmpty, IsEmail, IsBoolean, IsNumber, IsOptional, IsDate, Length,
    IsNumberString, IsIn, Matches
} from 'class-validator';

export class CreateUserDto {


    @IsString()
    @IsNotEmpty()
    name: string;


    @IsString()
    @IsNotEmpty()
    lastName: string;


    @IsString()
    @IsNotEmpty()
    @IsIn(['Femenino', 'Masculino', 'Otro'], { message: 'El género debe ser Femenino, Masculino u Otro' })
    gender: string;


    @IsEmail()
    @IsNotEmpty()
    email: string;



    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales',
    })
    password: string;


    @IsNumber()
    @IsNotEmpty()
    cellPhone: number;


    @IsNumber()
    @IsOptional()
    landline?: number;


    @IsString()
    @IsNotEmpty()
    @IsIn(['RC', 'TI', 'CC', 'C', 'DE'], {
        message: 'El tipo de identificación debe ser uno de: RC: Registro Civil, TI: Tarjeta de identidad, CC: Cédula de ciudadanía , C: Certificaciones / Constancias, DE: Documento extranjero',
    })
    IDType: string;

    @IsNumberString({}, { message: 'El número de identificación debe contener solo dígitos' })
    @Length(7, 10, { message: 'El número de identificación debe tener entre 7 y 10 dígitos' })
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

}


