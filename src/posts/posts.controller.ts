import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { JwtAuthGuard } from '../users/auth/jwt-auth.guard'; // Đảm bảo có JwtAuthGuard để xác thực token
import { CreatePostDto } from '../dto.all.ts/create-post.dto';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger'; // Nhập ApiBody và ApiResponse
import { Types } from 'mongoose';

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
  @ApiBearerAuth()
  async likePost(@Request() req, @Param('id') postId: string) {
    const post_Id = new Types.ObjectId(postId);

    const user_Id = req.user.userId;

    return this.postService.handleLikePost(user_Id, post_Id);
  }
}
