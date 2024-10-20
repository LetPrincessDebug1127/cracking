import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './register.dto';
import { LoginUserDto } from './login.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký account mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Đăng ký thất bại' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Đăng nhập thất bại' })
  @ApiBody({ type: LoginUserDto }) // Đảm bảo Swagger hiển thị các fields của LoginUserDto
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );

    if (!user) {
      throw new HttpException(
        'Tên đăng nhập hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { message: 'Đăng nhập thành công', user };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async getAllUsers(): Promise<any> {
    return this.usersService.getAllUsers();
  }
  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất người dùng' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(): Promise<any> {
    return { message: 'Đăng xuất thành công' }; // Bạn có thể xử lý thêm nếu cần
  }
}
