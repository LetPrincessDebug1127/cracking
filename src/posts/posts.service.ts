import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../models/posts.schema';
import { CreatePostDto } from '../dto.all.ts/create-post.dto';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly jwtService: JwtService,
  ) {}

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<object> {
    const newPost = new this.postModel({
      content: createPostDto.content,
      author: userId,
    });

    const savedPost = await newPost.save();

    return { postID: savedPost._id.toString() };
  }

  async handleLikePost(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
  ): Promise<object> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userIndex = post.likedBy.indexOf(userId);

    if (userIndex === -1) {
      // User hasn't liked the post yet, so we add them
      post.likedBy.push(userId);
      post.likes += 1; // Increase likes count
    } else {
      // User has already liked the post, so we remove them
      post.likedBy.splice(userIndex, 1);
      post.likes -= 1; // Decrease likes count
    }

    return await post.save(); // Save changes to the post
  }
}
