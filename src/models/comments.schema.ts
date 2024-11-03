import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId; // Liên kết đến Post

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId; // Liên kết đến User

  //   @Prop({ default: Date.now }) // chưa nghĩ ra tại sao cần, vì kinh phí eo hẹp nên chưa dùng
  //   createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
