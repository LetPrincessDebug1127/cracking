import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Comment extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  // Đánh dấu root comment = null
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
  replyTo: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// [
//   {
//     "id": "1",
//     "content": "Root comment",
//     "replyToId": null
//   },
//   {
//     "id": "2",
//     "content": "Reply 1 to root",
//     "replyToId": "1"
//   },
//   {
//     "id": "3",
//     "content": "Reply 2 to root",
//     "replyToId": "1"
//   },
//   {
//     "id": "4",
//     "content": "Reply 3 to root",
//     "replyToId": "1"
//   }
// ]
