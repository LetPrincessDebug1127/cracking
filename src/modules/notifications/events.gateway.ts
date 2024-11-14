import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WebSocketAuthGuard } from '../../middleware/WebSocketAuthGuard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway(3000, {
  cors: {
    origin: '*', // Cho phép tất cả các nguồn
  },
})
@UseGuards(WebSocketAuthGuard) // Áp dụng guard cho toàn bộ gateway
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Khi client kết nối
  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  // Khi client ngắt kết nối
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  // Hàm để push notification
  sendNotification(message: string) {
    this.server.emit('notification', message);
  }

  // Lắng nghe sự kiện từ client
  @SubscribeMessage('notification')
  handleNotification(client: Socket, payload: any): void {
    console.log('Notification request received:', payload);
    // Gửi thông báo đến client
    this.server.emit('notification', 'This is a test notification message!');
  }
}
