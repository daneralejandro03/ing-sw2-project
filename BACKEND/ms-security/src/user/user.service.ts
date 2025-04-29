import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { Role } from '../schemas/role.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectConnection() private readonly connection: Connection,
    private emailService: EmailService,
  ) { }


  async create(createUserDto: CreateUserDto) {
    const exists = await this.userModel.findOne({ email: createUserDto.email });
    if (exists) throw new BadRequestException('Email ya registrado');

    const role = await this.roleModel.findById(createUserDto.role).exec();
    if (!role) throw new NotFoundException('Rol no encontrado');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const [createdUser] = await this.userModel.create([{
        ...createUserDto,
        password: hashedPassword,
        role: role._id,
        estado: false,
        verificationCode,
        verificationCodeExpires: verificationExpires,
        requiresTwoFactor: false,
      }], { session });

      await this.roleModel.updateOne(
        { _id: role._id },
        { $push: { users: createdUser._id } },
        { session },
      ).exec();

      await session.commitTransaction();
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      await session.abortTransaction();
      throw new BadRequestException('Error creando usuario');
    } finally {
      session.endSession();
    }

    // 6) Enviar email de verificación
    await this.emailService.sendMail({
      address: createUserDto.email,
      subject: 'Código de verificación',
      plainText: `Tu código es: ${verificationCode}. Expira en 15 minutos.`,
    });

    return { message: 'Usuario creado, revisa tu email para verificar la cuenta' };
  }

  async findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).populate('role');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
