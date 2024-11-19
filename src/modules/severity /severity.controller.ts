import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SeverityProfileService } from './severity.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { CalculatePasiDto } from '../dto.all.ts/severityProfile/pasi.dto';
import { Types } from 'mongoose';

@ApiTags('Severity Profiles')
@Controller('severity-profile')
export class SeverityProfileController {
  constructor(
    private readonly severityProfileService: SeverityProfileService,
  ) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tính mức độ tổn thương da và tạo hồ sơ severity',
  })
  @ApiBody({ type: CalculatePasiDto })
  @ApiResponse({
    status: 201,
    description: 'Đã tạo hồ sơ severity thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tính toán thất bại.',
  })
  async createProfile(@Req() req, @Body() data: CalculatePasiDto) {
    try {
      const user_id = new Types.ObjectId(req.user.userId);

      if (!user_id) {
        throw new HttpException('userId không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      return await this.severityProfileService.createProfile(user_id, data);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Internal server error',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
