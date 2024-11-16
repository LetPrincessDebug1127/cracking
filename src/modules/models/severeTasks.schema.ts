import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class dailyTasksSevere extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  tasks: string;

  @Prop({ type: Boolean, required: true, default: false })
  completed: boolean;
}
export const dailyTasksSchema = SchemaFactory.createForClass(dailyTasksSevere);
