import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class StandardDailyTask extends mongoose.Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeverityProfile',
    required: true,
  })
  user_id: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvailableTask',
    required: true,
  })
  task_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['todo', 'completed'],
    required: true,
    default: 'todo',
  })
  completed: string;
}

export const StandardDailyTaskSchema =
  SchemaFactory.createForClass(StandardDailyTask);
