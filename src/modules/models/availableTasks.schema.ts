import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AvailableTask extends Document {
  @Prop({
    type: String,
    enum: ['food', 'beverage'],
    required: true,
    unique: true,
  })
  kind: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: String,
    enum: ['standard', 'mild'],
    required: true,
    default: 'standard',
  })
  difficulty: string;

  // @Prop({ type: Number, required: false, default: 0 })
  // points: number;
}

export const AvailableTaskSchema = SchemaFactory.createForClass(AvailableTask);
