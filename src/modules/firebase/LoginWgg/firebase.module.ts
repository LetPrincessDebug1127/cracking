import { Module } from '@nestjs/common';
import { AuthController } from './firebase.controller';
import { FirebaseAdminService } from './firebase.service';
const { initializeApp } = require('firebase-admin/app');
import { NotificationController } from '../FCloudMessaging/fcm.controller';
import { FcmService } from '../FCloudMessaging/fcm.service';

@Module({
  controllers: [AuthController, NotificationController],
  providers: [FirebaseAdminService, FcmService],
  exports: [FirebaseAdminService, FcmService],
})
export class AuthModule {}
