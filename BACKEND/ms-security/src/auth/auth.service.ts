import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
//import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ToggleTwoFactorDto } from './dto/toggle-two-factor.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { User } from 'src/schemas/user.schema';
import { Role } from 'src/schemas/role.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectConnection() private readonly connection: Connection,

    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(dto: CreateUserDto) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new BadRequestException('Email ya registrado');

    const role = await this.roleModel.findById(dto.roleId).exec();
    if (!role) throw new NotFoundException('Rol no encontrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const [createdUser] = await this.userModel.create([{
        ...dto,
        password: hash,
        role: role._id,
        estado: false,
        verificationCode: code,
        verificationCodeExpires: expires,
        requiresTwoFactor: false,
      }], { session });

      await this.roleModel.updateOne(
        { _id: role._id },
        { $push: { users: createdUser._id } },
        { session }
      ).exec();

      await session.commitTransaction();
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      await session.abortTransaction();
      throw new BadRequestException('Error al registrar usuario');
    } finally {
      session.endSession();
    }

    await this.emailService.sendMail({
      address: dto.email,
      subject: 'Código de verificación',
      plainText: `Tu código es: ${code}. Expira en 15 minutos.`,
    });

    return { message: 'Usuario registrado, revisa tu email' };
  }

  async verify({ email, code }: VerifyCodeDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuario no existe');
    if (user.estado === true) throw new BadRequestException('Usuario ya verificado');
    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      throw new BadRequestException('Código inválido o expirado');
    }
    user.estado = true;
    user.verificationCode = "";
    user.verificationCodeExpires = new Date(0);
    await user.save();
    const token = this.jwtService.sign({ id: user._id });
    return { message: 'Cuenta verificada', token };
  }

  async resend({ email }: ResendCodeDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuario no existe');
    if (user.estado === true) throw new BadRequestException('Ya verificado');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await this.emailService.sendMail({
      address: email,
      subject: 'Nuevo código de verificación',
      plainText: `Tu nuevo código es: ${code}.`,
    });
    return { message: 'Código reenviado' };
  }

  async toggleTwoFactor(dto: ToggleTwoFactorDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('Usuario no existe');

    user.requiresTwoFactor = dto.enable;
    await user.save();

    return { message: `2FA ${dto.enable ? 'habilitado' : 'deshabilitado'} correctamente` };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Credenciales inválidas');
    }

    if (!user.requiresTwoFactor) {
      const payload = { id: user._id, email: user.email };
      return { access_token: this.jwtService.sign(payload) };
    }

    // Generar código 2FA si aún no existe o está expirado
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    user.twoFactorCode = code;
    user.twoFactorCodeExpires = expires;
    await user.save();

    await this.emailService.sendMail({
      address: email,
      subject: 'Código 2FA',
      plainText: `Tu código 2FA es: ${code}. Expira en 10 minutos.`,
    });

    return { message: 'Código 2FA enviado, revisa tu correo' };
  }

  async twoFactor({ email, code }: TwoFactorDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuario no existe');
    if (user.twoFactorCode !== code || user.twoFactorCodeExpires < new Date()) {
      throw new BadRequestException('Código 2FA inválido o expirado');
    }
    user.twoFactorCode = "";
    user.twoFactorCodeExpires = new Date(0);
    await user.save();
    const token = this.jwtService.sign({ id: user._id, email });
    return { access_token: token };
  }

  async validateUser(email: string, password: string): Promise<User | null> {

    const userWithPassword = await this.userModel.findOne({ email });

    if (!userWithPassword) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isPasswordValid) {
      return null;
    }

    const user = await this.userModel.findOne(
      { email },
      { password: 0 }
    );

    if (user && user.requiresTwoFactor) {
      return { ...userWithPassword.toObject(), requiresTwoFactor: true };
    }

    return user;
  }
}
