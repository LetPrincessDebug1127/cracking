import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../register.dto';
import { JwtAuthGuard } from '../jwt-auth.guard'; // Giả định bạn có guard này
import { Roles } from './role.decorator'; // Giả định bạn có decorator cho vai trò
import { RolesGuard } from './roles'; // Giả định bạn có guard cho vai trò
import { UserRole } from './user-role.enum';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-user')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ API
  // @Roles(UserRole.ADMIN) // Chỉ admin mới được truy cập
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin user successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateUserDto })
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    // Tương tự như hàm register nhưng chỉ định vai trò là admin
    return this.usersService.createAdmin(createUserDto);
  }
}
