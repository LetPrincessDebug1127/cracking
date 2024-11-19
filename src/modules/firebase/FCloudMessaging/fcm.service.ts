import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../LoginWgg/firebase.service'; // Đảm bảo import đúng đường dẫn
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        token,
        data,
      };
      // Sử dụng Firebase Admin SDK đã được khởi tạo từ FirebaseAdminService
      const response = await this.firebaseAdminService
        .getAdminApp()
        .messaging()
        .send(message);
      this.logger.log(`Notification sent: ${response}`);
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
      throw error;
    }
  }
}
