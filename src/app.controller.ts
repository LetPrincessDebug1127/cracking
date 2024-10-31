import { Controller, Get, Query, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './users/auth/jwt-auth.guard';
import { RolesGuard } from './users/auth/role-admin/roles'; // Giả định bạn có guard cho vai trò
import { UserRole } from './users/auth/role-admin/user-role.enum';

import { Roles } from './users/auth/role-admin/role.decorator'; // Adjust the import path accordingly

@ApiTags('game-logIn-ToPlay')
@Controller('game')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('guess')
  async guess(@Query('number') number: string): Promise<string> {
    const userGuess = parseInt(number, 10);
    if (isNaN(userGuess)) {
      return 'Vui lòng nhập một số hợp lệ.';
    }
    return this.appService.guessNumber(userGuess, 'authenticatedUser');
  }
  @Get('current-number')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Lấy current number thành công',
  })
  @ApiResponse({
    status: 403,
    description: 'Bạn cần tài khoản Admin để thực hiện',
  })
  getCurrentNumber(): number {
    return this.appService.getCurrentNumber();
  }
}
