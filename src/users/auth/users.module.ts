import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller'; // Đảm bảo đường dẫn đúng
import { UsersService } from './users.service'; // Đảm bảo đường dẫn đúng
import { User, UserSchema } from './user.schema'; // Đảm bảo đường dẫn đúng

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Đăng ký schema cho User
  ],
  controllers: [UsersController], // Đăng ký controller
  providers: [UsersService], // Đăng ký service
})
export class UsersModule {}
