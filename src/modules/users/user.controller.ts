import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateUserDto } from '../dto.all.ts/users/register.dto';
import { LoginUserDto } from '../dto.all.ts/users/login.dto';
import { SecurityAnswerUserDto } from '../dto.all.ts/users/security.answer.dto';
import { AuthService } from './refreshToken.service';
import { RefreshTokenDto } from '../dto.all.ts/users/refresh-token.dto';
import { ResetPasswordDto } from '../dto.all.ts/users/reset-password.dto';
import { RolesGuard } from '../../guards/roles';
import { UserRole } from '../../shared/enum/user-role.enum';
import { Response } from 'express';

import { Roles } from '../role-admin/role.decorator';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công với vai trò user',
  })
  @ApiResponse({
    status: 400,
    description:
      'Đăng ký thất bại vì các lí do : tài khoản hoặc mật khẩu ít hơn 5 kí tự, không có kí tự đặc biệt, tài khoản trùng lặp',
  })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
     const result = await this.usersService.register(createUserDto);
     return { message: result };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập. Khóa tài khoản 5 phút sau 5 lần đăng nhập thất bại',
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({
    status: 401,
    description:
      'Đăng nhập thất bại vì các lí do: tài khoản không tồn tại, tài khoản bị khóa vì đăng nhập thất bại quá nhiều lần',
  })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough : true}) response : Response 
  ) {
    const tokens = await this.usersService.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );
    // bên register nó chỉ có 2 errors là existing account hoặc ko đúng định dạng dto thôi, mà existing bên service xử lý rồi con data khớp dto thì controller nhận type đầu vào
    if (!tokens) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // lưu rf token vào http only
    response.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    return { access_token: tokens.access_token };
    }
  @Post('get-otp')
  @ApiOperation({
    summary: 'Lấy OTP từ security answer, bạn chỉ có thể gửi OTP mỗi 5 phút',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid security answer.' })
  async getOTP(@Body() username: SecurityAnswerUserDto) {
    const result = await this.usersService.getOtp(
      username.username
    );

    if (!result) {
      throw new UnauthorizedException('Câu trả lời không chính xác');
    }

    return {
      message: 'OTP đã được gửi đến bạn ♡',
      otp: result.otp,
    };
  }
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 401, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Invalid security answer.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const otp = await this.usersService.resetPassword(resetPasswordDto);
    return { otp };
  }
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for a user' })
  @ApiResponse({ status: 200, description: 'OTP successfully verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        otp: { type: 'string' },
      },
      required: ['username', 'otp'],
    },
  })
  async verifyOtp(
      @Body() { username, otp }: { username: string; otp: string },
      @Res({ passthrough: true }) response: Response,
    ) {
      const { access_token, refresh_token } = await this.usersService.verifyOtp(username, otp);

      if (!access_token || !refresh_token) {
        throw new UnauthorizedException('Invalid OTP or failed to generate tokens');
      }

      // Lưu refresh token vào HTTP-only cookie
      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      // Trả về access token trong phản hồi
      return { access_token };
    }
  @Post('refresh-token')
  @ApiOperation({
    summary: '',
  })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({
    description: 'Refresh token payload',
    type: RefreshTokenDto,
  })
  async refreshToken(
    @Body() body: { refresh_token: string },
    @Res({ passthrough: true }) response: Response) {
    
    const { refresh_token } = body;
    const tokens = await this.authService.refreshAccessToken(refresh_token);
    response.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // Thời gian hết hạn của refresh token
    });
    return { access_token: tokens.access_token };
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, allowing only Admin account.',
  })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
