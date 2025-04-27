import { Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from '../schemas/permission.schema';
import { Role, RoleSchema } from '../schemas/role.schema';
import { Access, AccessSchema } from '../schemas/access.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Access.name, schema: AccessSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },

    ]),
  ],
  controllers: [AccessController],
  providers: [AccessService],
})
export class AccessModule { }
