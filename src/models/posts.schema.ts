import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {User} from '../models/user.schema'

@Schema()
export class Post extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId; // Liên kết đến User

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: Types.ObjectId[]; // Mảng chứa user IDs đã like bài viết

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
  comments: Types.ObjectId[]; // Mảng chứa các comment IDs liên kết đến bài viết
  
}



export const PostSchema = SchemaFactory.createForClass(Post);
