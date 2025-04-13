import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
})
export class User {
    @Prop()
    firstName: string;

    @Prop()
    secondName: string;

    @Prop()
    firstLastName: string;

    @Prop()
    secondLastName: string;

    @Prop()
    gender: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({ default: false })
    estado: boolean;

    @Prop()
    cellPhone: number;

    @Prop()
    landline: number;

    @Prop()
    IDType: string;

    @Prop()
    IDNumber: string;

    // Campos para verificación de correo electrónico
    @Prop()
    verificationCode: string;

    @Prop()
    verificationCodeExpires: Date;

    // Campos para autenticación de dos factores (2FA)
    @Prop()
    twoFactorCode: string;

    @Prop()
    twoFactorCodeExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
