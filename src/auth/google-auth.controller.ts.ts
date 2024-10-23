import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Oauth2')
@Controller('auth/google')
export class GoogleAuthController {
  @Get()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Chuyển hướng đến Google để xác thực' })
  @ApiResponse({
    status: 302,
    description: 'Chuyển hướng đến trang đăng nhập của Google.',
  })
  async googleAuth(@Req() req) {
    // Hàm này sẽ tự động chuyển hướng đến Google
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Nhận kết quả sau khi người dùng xác thực từ Google',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin người dùng sau khi đăng nhập thành công.',
    schema: {
      example: {
        email: 'user@example.com',
        firstName: 'Ngan',
        lastName: 'Pham',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Xác thực thất bại' })
  googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    res.json(user); // Trả về thông tin người dùng dưới dạng JSON
  }
}
