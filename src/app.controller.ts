import {
  Controller,
  Get,
  Query,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/jwtstrategy/jwt-auth.guard';
import { RolesGuard } from './modules/users/auth/role-admin/roles';
import { UserRole } from './modules/users/auth/role-admin/user-role.enum';

import { Roles } from './modules/users/auth/role-admin/role.decorator';

//req.user là cơ chế đặc biệt của jwtAuthGuard, sau khi validate payload nó auto gán vào req.user luôn

@ApiTags('game-logIn-ToPlay')
@Controller('game')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('guess')
  async guess(
    @Query('number') number: string,
    @Request() req,
  ): Promise<string> {
    const userGuess = parseInt(number, 10);
    if (isNaN(userGuess)) {
      return 'Vui lòng nhập một số hợp lệ.';
    }

    // Lấy username từ req.user
    const username = req.user.username; // Giả sử req.user chứa username
    return this.appService.guessNumber(userGuess, username);
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
