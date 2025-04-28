import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from 'src/schemas/permission.schema';

@Injectable()
export class PermissionService {

  constructor(@InjectModel(Permission.name) private readonly permissionModel: Model<Permission>) { }

  create(createPermissionDto: CreatePermissionDto) {
    return this.permissionModel.create(createPermissionDto);
  }

  findAll() {
    return this.permissionModel.find();
  }

  findOne(id: string) {
    return this.permissionModel.findById(id).populate('access');
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionModel.findByIdAndUpdate(id, updatePermissionDto, {
      new: true,
    })
  }

  remove(id: string) {
    return this.permissionModel.findByIdAndDelete(id);
  }
}
