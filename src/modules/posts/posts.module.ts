import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PostController } from './posts.controller';
import { PostService } from './posts.service';
import { Post, PostSchema } from '../models/posts.schema';
import { User, UserSchema } from '../models/user.schema';
import { Comment, CommentSchema } from '../models/comments.schema';
import { commentController } from './comments.controller';
import { SocketModule } from '../notifications/events.module';
// import { NotificationsController } from '../notifications/events.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),

    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '600s' },
      }),
      inject: [ConfigService],
    }),
    SocketModule,
  ],

  controllers: [PostController, commentController],
  providers: [PostService, SocketModule],
  exports: [PostService],
})
export class PostsModule {}
