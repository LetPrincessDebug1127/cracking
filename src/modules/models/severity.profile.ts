import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';

@Schema()
export class SeverityProfile extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 100, min: 0, max: 72 })
  severityPercentage: number;

  @Prop({ type: Number, required: true, default: 0 })
  sunPoints: number;
}
export const SeveritySchema = SchemaFactory.createForClass(SeverityProfile);
