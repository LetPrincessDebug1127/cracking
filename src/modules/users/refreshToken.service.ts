import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      // Xác thực refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 1. Vô hiệu hóa refresh token cũ
      await this.usersService.invalidateRefreshToken(refreshToken);

      // 2. Tạo access token mới
      const newAccessToken = this.jwtService.sign(
        { username: decoded.username, sub: decoded.sub },
        { expiresIn: '15m' },
      );

      // 3. Tạo refresh token mới
      const newRefreshToken = this.jwtService.sign(
        { username: decoded.username, sub: decoded.sub },
        { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
