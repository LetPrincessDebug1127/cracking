import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendNotificationDto } from '../../dto.all.ts/fcm.notification';

@ApiTags('Firebase Cloud Messaging - Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly fcmService: FcmService) {}

  @Post()
  @ApiOperation({ summary: 'Send a push notification' })
  @ApiBody({
    description: 'Notification payload',
    type: SendNotificationDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully!',
  })
  @ApiResponse({
    status: 500,
    description: 'Error sending notification',
  })
  async sendNotification(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ): Promise<string> {
    await this.fcmService.sendNotification(token, title, body);
    if (!token) {
      throw new BadRequestException('Token is required.');
    }
    return 'Notification sent successfully!';
  }
}
// Backend: Sử dụng để gửi thông báo push đến các thiết bị, quản lý các token thiết bị và quyết định khi nào và ai sẽ nhận thông báo.
// Frontend: Sử dụng để nhận thông báo push, đăng ký và lấy device token, và xử lý thông báo khi nhận được từ backend.
