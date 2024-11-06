import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../models/posts.schema';
import { CreatePostDto } from '../dto.all.ts/create-post.dto';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { User } from '../models/user.schema';
import { Comment } from '../models/comments.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,

    private readonly jwtService: JwtService,
  ) {}

  async createPost(
    userId: Types.ObjectId,
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

  // hàm này mình không trả về Promise vì mình toString() ở return nên TS dự đoán được kiểu

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

  // hàm này mình không trả về Promise vì mình toString() ở return nên TS dự đoán được kiểu

  async createComment(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    createPostDto: CreatePostDto,
  ) {
    const post_Id = await this.postModel.findById(postId);
    const user_Id = await this.userModel.findById(userId);
    if (!post_Id) {
      throw new NotFoundException('Bài viết không tồn tại');
    }
    const newComment = new this.commentModel({
      content: createPostDto.content,
      author: user_Id,
      postId: post_Id,
    });
    const savedComment = await newComment.save();
    post_Id.comments.push(savedComment._id as Types.ObjectId);
    await post_Id.save();
    return {
      commentId: savedComment._id.toString(),
    };
  }

  async deleteComment(userId: Types.ObjectId, commentId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    if (user.role === 'admin') {
      await this.commentModel.findByIdAndDelete(commentId);
      return 'Comment đã bị xóa bởi Admin';
    }

    if (comment.author.equals(userId)) {
      await this.commentModel.findByIdAndDelete(commentId);
      return 'Comment đã bị xóa';
    } else {
      return 'Bạn không phải tác giả của comment này, không có quyền xóa.';
    }
  }
  // Chỗ này ban đầu mình bị một lỗi khá hay là quên await
  async commentsCount(postId: Types.ObjectId): Promise<number> {
    const post_Id = await this.postModel.findById(postId);
    if (!post_Id) {
      throw new NotFoundException('Bài viết không tồn tại');
    }
    return post_Id.comments.length;
  }

  async whoLiked(postId: Types.ObjectId): Promise<string[]> {
    const post = await this.postModel
      .findById(postId)
      .populate<{ likedBy: User[] }>('likedBy', 'username')
      .exec();

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }
    const likedUsernames = post.likedBy.map((user) => user.username);
    return likedUsernames;
  }
}
