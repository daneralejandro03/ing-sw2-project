import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAccessDto } from './dto/create-access.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { Model, Connection } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Access } from 'src/schemas/access.schema';
import { Role } from 'src/schemas/role.schema';
import { Permission } from 'src/schemas/permission.schema';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(Access.name) private accessModel: Model<Access>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(dto: CreateAccessDto): Promise<Access> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const [access] = await this.accessModel.create([dto], { session });
      const permUpdate = await this.permissionModel.updateOne(
        { _id: dto.permission },
        { $addToSet: { access: access._id } },
        { session },
      );
      if (permUpdate.matchedCount === 0) {
        throw new NotFoundException(`Permission ${dto.permission} not found`);
      }
      const roleUpdate = await this.roleModel.updateOne(
        { _id: dto.role },
        { $addToSet: { access: access._id } },
        { session },
      );
      if (roleUpdate.matchedCount === 0) {
        throw new NotFoundException(`Role ${dto.role} not found`);
      }
      await session.commitTransaction();
      return access;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof NotFoundException ? error : new BadRequestException('Failed to create access relation');
    } finally {
      session.endSession();
    }
  }


  findAll() {
    return this.accessModel.find();
  }

  findOne(id: string) {
    return this.accessModel.findById(id).populate('role').populate('permission');
  }

  update(id: string, updateAccessDto: UpdateAccessDto) {
    return this.accessModel.findByIdAndUpdate(id, updateAccessDto, {
      new: true,
    })
  }

  remove(id: string) {
    return this.accessModel.findByIdAndDelete(id);
  }
}


