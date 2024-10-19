import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('game')
@Controller('game')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Post('guess')
  @ApiResponse({ status: 200, description: 'Chưa biết để description gì' })
  @ApiResponse({ status: 400, description: 'Chưa biết để description gì' })
  guess(@Query('number') number: string): string {
    const userGuess = parseInt(number, 10);
    if (isNaN(userGuess)) {
      return 'Vui lòng nhập một số hợp lệ.';
    }
    return this.appService.guessNumber(userGuess);
  }

  @Get('current-number')
  @ApiResponse({ status: 200, description: 'Lấy số hiện tại.' })
  getCurrentNumber(): number {
    return this.appService.getCurrentNumber();
  }
}
