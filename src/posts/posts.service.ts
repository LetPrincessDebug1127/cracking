import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../models/posts.schema';
import { CreatePostDto } from '../dto.all.ts/create-post.dto';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { User } from '../models/user.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,

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
      throw new NotFoundException(
        'Không tìm thấy bài viết. Có vẻ id không đúng',
      );
    }
    //likeBy mình define bên schema là array, dùng indexOf để check index của user này coi họ có like chưa thì nếu ko tìm thấy nó sẽ trả về -1
    const userIndex = post.likedBy.indexOf(userId);

    if (userIndex === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
    } else {
      post.likedBy.splice(userIndex, 1);
      post.likes -= 1;
    }

    return await post.save();
  }

  async getLikesCount(postId: Types.ObjectId): Promise<number> {
    const getLike_post = await this.postModel.findById(postId);
    if (!getLike_post) {
      throw new NotFoundException('ID bài post không đúng, không tìm thấy');
    }
    return getLike_post.likes;
  }
  // mới đầu dùng if else lồng nhau xấu quá nên đổi qua if kiểu này, nhìn vẫn tệ:((
  async deletePost(userId: Types.ObjectId, postId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    const post = await this.postModel.findById(postId);

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    if (user.role === 'admin') {
      await this.postModel.findByIdAndDelete(postId);
      return 'Bài viết đã được xóa bởi admin';
    }

    if (!post.likedBy.includes(userId)) {
      return 'Bạn không có quyền sở hữu để xóa bài viết';
    }

    await this.postModel.findByIdAndDelete(postId);
    return 'Bài viết đã được xóa';
  }
}
