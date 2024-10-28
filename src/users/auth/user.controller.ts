import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './register.dto';
import { LoginUserDto } from './login.dto';

import { JwtRefreshTokenGuard } from './jwt-refresh-token.guard';
import { Request } from 'express';
import { AuthService } from './refreshToken.service';
import { RefreshTokenDto } from './refresh-token.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );
    // bên register nó chỉ có 2 errors là existing account hoặc ko đúng định dạng dto thôi, mà existing bên service xử lý rồi con data khớp dto thì controller nhận type đầu vào
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return user;
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
  ) {
    const isVerified = await this.usersService.verifyOtp(username, otp);

    if (!isVerified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({
    description: 'Refresh token payload',
    type: RefreshTokenDto,
  })
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshAccessToken(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
