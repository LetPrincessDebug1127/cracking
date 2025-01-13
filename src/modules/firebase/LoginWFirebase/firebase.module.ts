import { AuthController } from './firebase.controller';
import { FirebaseAdminService } from './firebase.service';
import { NotificationController } from '../FCloudMessaging/fcm.controller';
import { FcmService } from '../FCloudMessaging/fcm.service';
import { User, UserSchema } from '../../models/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
   imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController, NotificationController],
  providers: [FirebaseAdminService, FcmService],
  exports: [FirebaseAdminService, FcmService],
})
export class AuthModule {}
