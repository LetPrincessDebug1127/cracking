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

    if (!post)
      throw new NotFoundException(
        'Không tìm thấy bài viết. Có vẻ id không đúng',
      );

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
      replyTo: null,
    });
    const savedComment = await newComment.save();
    // chỗ này viết hơi loạn, ý là comments của post thì save userId để api who-commented dùng còn id của comment riêng cho route getAllComments
    //còn api này trả về id của comment, 2 này khác nhau
    post_Id.comments.push(user_Id._id as Types.ObjectId);
    post_Id.commentReplies.push(savedComment._id as Types.ObjectId);

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

  async whoLiked(postId: Types.ObjectId): Promise<string[] | string> {
    const post = await this.postModel
      .findById(postId)
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

  // tự viết xong hàm này, xúc động lắm luôn. Mình nghĩ thế nào cũng có lỗi, nhưng nó chạy
  async responseComment(
    commentId: Types.ObjectId,
    contentResponse: CreatePostDto,
  ) {
    const parentComment = await this.commentModel.findById(commentId).exec();

    if (!parentComment) throw new NotFoundException('Không tìm thấy cmt gốc');

    const newComment = new this.commentModel({
      content: contentResponse.content,
      replyTo: commentId,
      postId: parentComment.postId,
      author: parentComment.author,
    });

    const savedResponse = await newComment.save();
    const post = await this.postModel.findById(savedResponse.postId);

    post.commentReplies.push(savedResponse._id as Types.ObjectId);
    await post.save();
    return {
      commentId: savedResponse._id.toString(),
    };
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
    content: CreatePostDto,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException();
  }
}
