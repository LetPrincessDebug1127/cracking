import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../models/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../jwtstrategy/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtRefreshTokenStrategy } from '../../jwtstrategy/jwt-refresh-token.strategy.ts';
import { AuthService } from './refreshToken.service';
import { AdminController } from '../role-admin/admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  controllers: [UsersController, AdminController],
  providers: [UsersService, JwtStrategy, JwtRefreshTokenStrategy, AuthService],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
