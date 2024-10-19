import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // đăng ký schema
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
