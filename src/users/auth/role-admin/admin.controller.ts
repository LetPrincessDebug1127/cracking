import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
  Request,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../register.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { Roles } from './role.decorator';
import { RolesGuard } from './roles';
import { UserRole } from './user-role.enum';
import { Types } from 'mongoose';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-user')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin user successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateUserDto })
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAdmin(createUserDto);
  }

  @Delete(':id/delete-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Đã xóa tài khoản thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Bạn phải là Admin để xóa tài khoản của người khác',
  })
  @ApiResponse({
    status: 404,
    description: 'Tài khoản không tồn tại',
  })
  async deleteUser(@Request() req, @Param('id') userId: string) {
    const adminId = new Types.ObjectId(req.user.userId);
    const userToDelete = new Types.ObjectId(userId);
    return this.usersService.deleteUser(adminId, userToDelete);
  }
}
