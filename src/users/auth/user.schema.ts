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
}

export const UserSchema = SchemaFactory.createForClass(User);
