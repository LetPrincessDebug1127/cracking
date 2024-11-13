import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
  BadRequestException,
  Delete,
  Query,
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

@ApiTags('Comments')
@Controller('Comments')
export class commentController {
  constructor(private readonly postService: PostService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'ID của bài viết', type: String })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description:
      'Bạn đã phản hồi lại root comment hoặc bạn đã comment root comment thành công ',
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
    return this.postService.postComments(post_Id, user_Id, contentComment);
  }

  @Delete(':id')
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

  // @Post(':id/reply-To-Comment')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiParam({ name: 'id', description: 'ID của root comment', type: String })
  // @ApiOperation({ summary: 'Phản hồi lại một bình luận' })
  // @ApiResponse({
  //   status: 201,
  //   description:
  //     'bạn đã phản hồi lại một bình luận thành công. Bạn nhận về commentID của bình luận con bạn vừa comment',
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Bạn cần đăng nhập trước khi bình luận',
  // })
  // async replyToComment(
  //   @Param('id') commentId: string,
  //   @Body() contentreply: CreatePostDto,
  // ) {
  //   const comment = new Types.ObjectId(commentId);
  //   const content = contentreply;
  //   return this.postService.responseComment(comment, content);
  // }

  //phân trang
  @Get(':id/rootComments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description:
      'ID của bài viết, có thể dùng ID này để test : 672cc88812fcc210c2a5f325',
    type: String,
  })
  @ApiOperation({
    summary:
      'Lấy ra author, content comments, current Page và tổng số childComments của rootComments',
  })
  @ApiResponse({
    status: 201,
    description:
      'Bạn đã truy vấn thành công. Query bị false sẽ cho default = 1',
  })
  @ApiResponse({
    status: 401,
    description: 'Bạn cần đăng nhập trước khi bình luận',
  })
  // bên fe lo cái vụ query này
  async paginationComments(
    @Param('id') postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const postObjectId = new Types.ObjectId(postId);
    const page = query.page > 0 ? query.page : 1;
    return this.postService.paginationComments(postObjectId, page);
  }

  @Get(':id/childComments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description:
      'ID của root comment, có thể dùng ID này để test : 672cce4f481274c057ba29f0',
    type: String,
  })
  @ApiOperation({
    summary:
      'Lấy ra author, content comments của rootComments. Trải phẳng child comments',
  })
  @ApiResponse({
    status: 201,
    description: 'Bạn đã truy vấn thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Bạn cần đăng nhập trước khi bình luận',
  })
  async getChildComments(@Param('id') rootCommentId: string) {
    const rootComment = new Types.ObjectId(rootCommentId);
    return this.postService.getAllChildComments(rootComment);
  }
}
