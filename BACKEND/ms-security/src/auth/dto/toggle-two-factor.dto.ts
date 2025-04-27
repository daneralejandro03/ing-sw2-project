import { IsEmail, IsBoolean } from 'class-validator';

export class ToggleTwoFactorDto {
    @IsEmail()
    email: string;

    @IsBoolean()
    enable: boolean;
}
