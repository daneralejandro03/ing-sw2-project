import { IsString, IsNotEmpty } from 'class-validator';


export class CreatePermissionDto {

    @IsString()
    @IsNotEmpty()
    readonly url: string;

    @IsString()
    @IsNotEmpty()
    readonly method: string;

    @IsString()
    @IsNotEmpty()
    readonly module: string;

    @IsString()
    @IsNotEmpty()
    readonly description: string;
}
