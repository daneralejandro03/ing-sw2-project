import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role, RoleSchema } from 'src/schemas/role.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Access, AccessSchema } from 'src/schemas/access.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Access.name, schema: AccessSchema },
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule { }
