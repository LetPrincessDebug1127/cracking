import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// cái này không cần timestamp
@Schema()
export class AvailableTask extends Document {
  @Prop({
    type: String,
    enum: ['food', 'beverage'],
    required: true,
  })
  kind: ['food', 'beverage'];

  @Prop({ type: String, required: true, unique: true })
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
