import { Controller, Get, Query, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './users/auth/jwt-auth.guard';

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
  @ApiResponse({ status: 200, description: 'Lấy số hiện tại.' })
  getCurrentNumber(): number {
    return this.appService.getCurrentNumber();
  }
}
