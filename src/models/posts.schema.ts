import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../models/user.schema';
import { Types } from 'mongoose';

@Schema()
export class Post extends mongoose.Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId[];

  @Prop({ default: 0 })
  likes: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  likedBy: Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  comments: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
