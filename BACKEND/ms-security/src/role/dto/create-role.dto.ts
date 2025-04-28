import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../../enums/role.enum';



export class CreateRoleDto {
    @IsEnum(Role)
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
