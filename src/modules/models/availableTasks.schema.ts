import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AvailableTask extends Document {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: [{ title: String, content: String }], required: true })
  description: { title: string; content: string }[];

  @Prop({
    type: String,
    enum: ['standard', 'mild'],
    required: true,
    default: 'standard',
  })
  difficulty: string;

  @Prop({ type: Number, required: false, default: 0 })
  points: number;
}

export const AvailableTaskSchema = SchemaFactory.createForClass(AvailableTask);
