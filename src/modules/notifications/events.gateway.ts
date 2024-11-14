import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway(3000, {
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>(); // Map userId to socketId

  constructor(private readonly configService: ConfigService) {} // Inject ConfigService

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token; // JWT token from client
      if (!token) {
        console.log('No token provided by client');
        client.disconnect(); // Disconnect if no token
        return;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET'); // Get JWT_SECRET from ConfigService
      const decoded: any = jwt.verify(token, jwtSecret); // Verify token using JWT_SECRET
      const userId = decoded.sub; // Assuming `sub` contains the userId

      if (userId) {
        this.connectedClients.set(userId, client.id);
        console.log(`User connected: ${userId} with socket ID: ${client.id}`);
      } else {
        console.log('Invalid token, no userId found');
        client.disconnect(); // Disconnect if userId is invalid
      }
    } catch (error) {
      console.error('Error during connection:', error.message);
      client.disconnect(); // Disconnect on error
    }
  }

  handleDisconnect(client: Socket) {
    // Remove userId mapping when client disconnects
    for (const [userId, socketId] of this.connectedClients.entries()) {
      if (socketId === client.id) {
        this.connectedClients.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  sendNotification(message: string) {
    this.server.emit('notification', message);
  }

  sendNotificationToUser(userId: string, message: string): void {
    try {
      const socketId = this.connectedClients.get(userId);
      if (socketId) {
        const client = this.server.sockets.sockets.get(socketId);
        if (client) {
          client.emit('notification', message);
          console.log(`Notification sent to user ${userId}: ${message}`);
        } else {
          console.log(`Client with socket ID ${socketId} is not connected`);
        }
      } else {
        console.log(`User ${userId} is not connected`);
      }
    } catch (error) {
      console.error('Error sending notification:', error.message);
    }
  }
}
