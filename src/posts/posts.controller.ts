import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
  BadRequestException,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { JwtAuthGuard } from '../users/auth/jwt-auth.guard';
import { CreatePostDto } from '../dto.all.ts/create-post.dto';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { RolesGuard } from '../users/auth/role-admin/roles';
import { UserRole } from '../users/auth/role-admin/user-role.enum';
import { Roles } from '../users/auth/role-admin/role.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create-post')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Bài viết đã được tạo thành công.' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập.' })
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    const user_Id = req.user.userId;

    if (!user_Id) {
      throw new BadRequestException('userId không hợp lệ');
    }

    return this.postService.createPost(user_Id, createPostDto);
  }
  @Post(':id/click-like')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Đã like thành công.' })
  @ApiResponse({
    status: 401,
    description: 'Đăng nhập để có quyền tương tác bài viết',
  })
  @ApiBearerAuth()
  async likePost(@Request() req, @Param('id') postId: string) {
    const post_Id = new Types.ObjectId(postId);

    const user_Id = new Types.ObjectId(req.user.userId);

    return this.postService.handleLikePost(user_Id, post_Id);
  }

  @Get(':id/total-likes')
  @ApiResponse({
    status: 201,
    description: 'Lấy tổng số likes của một bài Post thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Bạn phải dùng tài khoản Admin mới truy vấn được',
  })
  async getLikesCount(
    @Param('id') postId: string,
  ): Promise<{ message: string }> {
    const post_Id = new Types.ObjectId(postId);

    const likes = await this.postService.getLikesCount(post_Id);
    return { message: `Bài viết này có tổng cộng ${likes} likes.` };
  }

  @Delete(':id/delete-post')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Đã xóa bài post thành công',
  })
  @ApiResponse({
    status: 401,
    description:
      'Bạn phải dùng tài khoản Admin hoặc là User sỡ hữu bài viết mới xóa được',
  })
  async deletePost(@Request() req, @Param('id') postId: string) {
    const post_Id = new Types.ObjectId(postId);
    const user_Id = req.user.userId;
    return this.postService.deletePost(user_Id, post_Id);
  }

  @Post(':id/create-comment')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'ID của bài viết', type: String })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Đã comment thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Vui lòng đăng nhập để comment',
  })
  async createComment(
    @Request() req,
    @Param('id') postId: string,

    @Body() createPostDto: CreatePostDto,
  ) {
    const post_Id = new Types.ObjectId(postId);
    const user_Id = req.user.userId;
    const contentComment = createPostDto;
    if (!contentComment.content) {
      throw new BadRequestException('Nội dung comment không hợp lệ');
    }
    return this.postService.createComment(user_Id, post_Id, contentComment);
  }

  @Delete(':id/delete-comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Đã xóa bài comment thành công',
  })
  @ApiResponse({
    status: 401,
    description:
      'Bạn phải dùng tài khoản Admin hoặc là User sỡ hữu comment mới xóa được',
  })
  async deleteComment(@Request() req, @Param('id') commentId: string) {
    const user = req.user.userId;
    const comment = new Types.ObjectId(commentId);
    return this.postService.deleteComment(user, comment);
  }

  @Get(':id/total-comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Lấy tổng số comments của một bài Post thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Bạn phải đăng nhập mới truy vấn được',
  })
  async getTotalComments(
    @Param('id') postId: string,
  ): Promise<{ message: string }> {
    const post_Id = new Types.ObjectId(postId);
    const total = await this.postService.commentsCount(post_Id);
    return { message: `Bài viết này có tổng cộng ${total} bình luận` };
  }

  @Get(':id/who-liked')
  @ApiResponse({
    status: 201,
    description: 'Đây là danh sách những ai đã like bài viết này',
  })
  @ApiResponse({
    status: 400,
    description: 'Lấy danh sách thất bại',
  })
  async whoLiked(@Param('id') postId: string) {
    const post_Id = new Types.ObjectId(postId);
    return this.postService.whoLiked(post_Id);
  }

  @Get(':id/who-commented')
  @ApiResponse({
    status: 201,
    description: 'Đây là danh sách những ai đã comment bài viết này',
  })
  @ApiResponse({
    status: 400,
    description: 'Lấy danh sách thất bại',
  })
  async whoCommented(@Param('id') postId: string) {
    const post_Id = new Types.ObjectId(postId);
    return this.postService.whoCommented(post_Id);
  }

  @Get(':id/total-contentComments-a-post')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Lấy nội dung tất cả bình luận của một bài Post thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Bạn phải dùng tài khoản Admin mới truy vấn được',
  })
  async getAllCommentsContent(@Param('id') postId: string) {
    const post = new Types.ObjectId(postId);
    return this.postService.getAllComments(post);
  }
}
