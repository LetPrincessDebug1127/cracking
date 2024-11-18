import {
  Controller,
  Post,
  Req,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../jwtstrategy/jwt-auth.guard';
import { CreateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { UpdateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
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
    const userId = new Types.ObjectId(req.user.userId);
    return this.calendarService.getTasksByUserAndDate(userId, taskDate);
  }
}
