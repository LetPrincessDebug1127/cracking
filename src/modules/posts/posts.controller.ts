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
  Query,
  Put,
  Req,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { JwtAuthGuard } from '../jwtstrategy/jwt-auth.guard';
import { CreatePostDto } from '../dto.all.ts/create-post.dto';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { RolesGuard } from '../users/auth/role-admin/roles';
import { UserRole } from '../users/auth/role-admin/user-role.enum';
import { Roles } from '../users/auth/role-admin/role.decorator';
import { PaginationQueryDto } from '../dto.all.ts/PaginationQueryDto';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
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
  @ApiOperation({
    summary: 'Thông báo socket đến chủ Post',
  })
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
  @Get(':id')
  @ApiOperation({
    summary: 'Chỉ thấy nội dung post, tổng số lượt like và cmt bài post',
  })
  @ApiResponse({
    status: 201,
    description: 'Lấy thông tin thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Lấy thông tin thất bại',
  })
  async getInformation(@Param('id') postId: string) {
    const post = new Types.ObjectId(postId);
    return this.postService.getInformationPost(post);
  }

  @Delete(':id')
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

  @Get(':id/who-liked')
  @ApiOperation({
    summary:
      'Khi người dùng cần ấn vào tổng số like tức là họ chỉ cần lấy ra list những ai like',
  })
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

  @UseGuards(JwtAuthGuard)
  @Put(':postId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'postId',
    description: 'ID của bài viết cần chỉnh sửa',
    type: String,
  })
  @ApiBody({
    description: 'Nội dung bài viết mới cần cập nhật',
    type: CreatePostDto,
  })
  async updatePost(
    @Req() req,
    @Param('postId') postId: string,
    @Body('content') updatedContent: string,
  ) {
    const userId = req.user.sub;
    return await this.postService.updatePost(
      new Types.ObjectId(userId),
      new Types.ObjectId(postId),
      updatedContent,
    );
  }
}
