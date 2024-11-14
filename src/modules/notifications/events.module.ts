import { NotificationsController } from './events.controller';
import { NotificationsGateway } from './events.gateway';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '600s' },
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [NotificationsController],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class SocketModule {}
