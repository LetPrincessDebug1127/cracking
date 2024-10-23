import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // Google login
  @Get('google')
  @ApiOperation({ summary: 'Login with Google' })
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Login with Facebook' })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req) {
    return req.user;
  }

  // Facebook login
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req) {
    return req.user;
  }
}
