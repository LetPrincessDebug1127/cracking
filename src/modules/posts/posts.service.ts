import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../models/posts.schema';
import { CreatePostDto } from '../dto.all.ts/posts/create-post.dto';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { User } from '../models/user.schema';
import { Comment } from '../models/comments.schema';
import { NotificationsGateway } from '../notifications/events.gateway';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,

    private readonly jwtService: JwtService,
    private readonly notificationsGateway: NotificationsGateway,
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

    if (!post)
      throw new NotFoundException(
        'Không tìm thấy bài viết. Có vẻ id không đúng',
      );

    const userIndex = post.likedBy.indexOf(userId);

    if (userIndex === -1) {
      post.likedBy.push(userId);
      post.likes += 1;

      // Gửi thông báo đến chủ sở hữu bài viết
      const totalLikes = post.likes;
      const ownerId = post.author.toString(); // Lấy ID của chủ bài viết
      this.notificationsGateway.sendNotificationToUser(
        ownerId,
        `${totalLikes} người đã like bài post của bạn`,
      );
    } else {
      post.likedBy.splice(userIndex, 1);
      post.likes -= 1;
    }

    return await post.save();
  }

  async getInformationPost(
    postId: Types.ObjectId,
  ): Promise<{ likes: number; comments: number; content: string }> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    return {
      likes: post.likes,
      comments: post.commentReplies.length,
      content: post.content,
    };
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

  async whoLiked(postId: Types.ObjectId): Promise<string[] | string> {
    const post = await this.postModel
      .findById(postId) //find thì nó return array rồi nên không cần assertion type là mảng User [], còn này findById
      .populate<{ likedBy: User[] }>('likedBy', 'username')
      .exec();

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }
    if (!post.likedBy || post.likedBy.length === 0) {
      return 'Bài viết này chưa có ai like';
    }
    const likedUsernames = post.likedBy.map((user) => user.username);
    return likedUsernames;
  }
  //   lấy ra ROOT COMMENT  !!!
  // lấy page từ querry param thôi, còn cố định 10 cmts mỗi trang
  async paginationComments(postId: Types.ObjectId, page: number) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const rootComments = await this.commentModel
      .find({ postId, replyTo: null })
      .skip(skip)
      .limit(limit)
      .populate<{ author: User }>('author', 'username')
      .exec();

    const allComments = await this.commentModel.find({ postId }).exec();

    // child comments
    // thêm key-value pair vào bằng cú pháp object[key]= value
    //
    const childCommentMap = allComments.reduce((map, comment) => {
      if (comment.replyTo) {
        const parentId = comment.replyTo.toString();
        map[parentId] = (map[parentId] || 0) + 1;
      }
      return map;
    }, {});

    // arrow func trả về 1 object nên nó cần () bao quanh
    const data = rootComments.map((comment) => ({
      author: comment.author.username,
      content: comment.content,
      childComments: childCommentMap[comment._id.toString()] || 0,
    }));

    return {
      currentPage: page,
      comments: data,
    };
  }

  async getAllChildComments(rootCommentId: Types.ObjectId) {
    const rootComment = await this.commentModel.findById(rootCommentId);
    if (!rootComment)
      throw new NotFoundException('Bình luận gốc không tồn tại');

    const childCommentsList = await this.commentModel
      .find({ replyTo: rootCommentId })
      .populate<{ author: User }>('author', 'username')
      .exec();

    const data = childCommentsList.map((comment) => ({
      author: comment.author.username,
      content: comment.content,
    }));

    return {
      rootCommentId,
      childComments: data,
    };
  }
  async postComments(
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    createDtoPost: CreatePostDto,
  ): Promise<{ commentId: string; message: string }> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const allComments = await this.commentModel.find({
      postId,
    });

    // trả về 2 TH : một là mảng không rỗng => đây là rootComment
    // hai là mảng rỗng replyTo cái cmt root
    const childComment = await this.commentModel.find({
      postId,
      replyTo: null,
    });

    const newComment = new this.commentModel({
      content: createDtoPost.content,
      author: userId,
      postId: postId,
      //nếu rơi vào TH1 thì nó false, nó false thì nó là childComment gán replyTo vào root comment
      replyTo: childComment.length === 0 ? null : childComment[0]._id, //childComment[0] là mảng rỗng, gán vào index id của rootComment
    });

    const savedComment = await newComment.save();

    post.comments.push(userId._id as Types.ObjectId);
    post.commentReplies.push(savedComment._id as Types.ObjectId);
    await post.save();

    const ownerId = post.author.toString();
    const totalCmt = post.commentReplies.length;
    this.notificationsGateway.sendNotificationToUser(
      ownerId,
      `Bài viết của bạn có ${totalCmt} bình luận mới`,
    );

    if (savedComment.replyTo !== null) {
      const parentComment = allComments.find(
        (comment) => comment._id.toString() === savedComment.replyTo.toString(),
      );

      if (parentComment) {
        const authorId = parentComment.author.toString();
        const countResponse = allComments.filter(
          (comment) =>
            comment.replyTo?.toString() === parentComment._id.toString(),
        ).length;

        this.notificationsGateway.sendNotificationToUser(
          authorId,
          `Bình luận của bạn có ${countResponse} phản hồi`,
        );
      }
    }

    const message =
      savedComment.replyTo === null
        ? 'Bạn đã tạo root comment thành công'
        : 'Bạn đã phản hồi lại root comment thành công';

    return {
      commentId: savedComment._id.toString(),
      message: message,
    };
  }

  async updatePost(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    updatedContent: string,
  ): Promise<{ message: string }> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    const isOwner = post.author.equals(userId);
    if (!isOwner) throw new Error('Bạn không có quyền chỉnh sửa bài viết này');
    post.content = updatedContent;
    await post.save();
    return { message: 'Bạn đã cập nhật bài viết thành công' };
  }
  async updateComment(
    userId: Types.ObjectId,
    commentId: Types.ObjectId,
    updatedContent: string,
  ): Promise<{ message: string }> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    const isOwner = comment.author.equals(userId);
    if (!isOwner) throw new Error('Bạn không có quyền chỉnh sửa bình luận này');
    comment.content = updatedContent;
    await comment.save();
    return { message: 'Bạn đã cập nhật bình luận thành công' };
  }
}
