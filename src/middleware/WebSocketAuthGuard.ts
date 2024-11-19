import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
//Kiểm tra sự tồn tại của token trong header => middleware
@Injectable()
export class WebSocketAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(client: any): Promise<boolean> {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      const payload = this.jwtService.verify(token);
      client.user = payload; // Gắn thông tin user vào client
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }
}
