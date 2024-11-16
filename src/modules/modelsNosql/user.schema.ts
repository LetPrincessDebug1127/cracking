import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  otp: string;

  @Prop()
  otpExpires: Date;

  @Prop({ required: true })
  answer_security: string;

  @Prop({ default: null })
  lastOtpRequest: Date;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop({ default: null })
  lockUntil: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
