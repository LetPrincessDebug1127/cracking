// import { Controller, Get, Query } from '@nestjs/common';
// import { NotificationsGateway } from './events.gateway';
// import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { Types } from 'mongoose';

// @ApiTags('Websocket')
// @Controller('notifications')
// export class NotificationsController {
//   constructor(private readonly notificationsGateway: NotificationsGateway) {}

//   @Get('send')
//   @ApiOperation({
//     summary: 'Gửi thông báo đến một user cụ thể hoặc tất cả users',
//   })
//   sendNotification(@Query('userId') userId?: string) {
//     const message = 'This is a notification message!';

//     if (userId) {
//       const objectId = new Types.ObjectId(userId); // Chuyển userId về dạng ObjectId nếu cần
//       this.notificationsGateway.sendNotificationToUser(
//         objectId.toString(),
//         message,
//       );
//     } else {
//       this.notificationsGateway.sendNotification(message);
//     }

//     return { message: 'Notification sent!' };
//   }
// }
