import { Module } from '@nestjs/common';
import { AuthController } from './firebase.controller';
import { FirebaseAdminService } from './firebase.service';
const { initializeApp } = require('firebase-admin/app');

@Module({
  controllers: [AuthController],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class AuthModule {}
