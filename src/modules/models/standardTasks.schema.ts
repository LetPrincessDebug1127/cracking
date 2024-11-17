import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class StandardDailyTask extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvailableTask',
    required: true,
  })
  task_id: Types.ObjectId;

  @Prop({ type: Boolean, required: true, default: false })
  completed: boolean;
}

export const StandardDailyTaskSchema =
  SchemaFactory.createForClass(StandardDailyTask);
