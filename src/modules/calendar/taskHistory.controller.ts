import { Controller, Post, Req, UseGuards, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CalendarService } from './taskHistory.service';

@ApiTags('Calendar')
@Controller('date')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy ra tasks đã làm dựa trên ngày',
  })
  @ApiResponse({
    status: 201,
    description: 'Lấy ra tasks theo ngày thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Truy vấn thất bại',
  })
  @ApiBearerAuth()
  async getTaskByDate(@Req() req, @Query('taskDate') taskDate: Date) {
    const date = new Date(taskDate);
    const userId = new Types.ObjectId(req.user.userId);
    return this.calendarService.getTasksByUserAndDate(userId, date);
  }
}
