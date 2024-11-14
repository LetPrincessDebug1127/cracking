import { Controller, Get } from '@nestjs/common';
import { NotificationsGateway } from './events.gateway';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Websocket')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @Get('send')
  sendNotification() {
    const message = 'This is a notification message!';
    this.notificationsGateway.sendNotification(message);
    return { message: 'Notification sent!' };
  }
}
