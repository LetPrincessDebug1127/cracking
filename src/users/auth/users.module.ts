// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UsersController } from './user.controller';
// import { UsersService } from './users.service';
// import { User, UserSchema } from './user.schema';
// import { JwtModule } from '@nestjs/jwt';
// import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//     JwtModule.register({
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '60s' },
//     }),
//   ],
//   controllers: [UsersController],
//   providers: [UsersService, JwtStrategy],
//   exports: [UsersService],
// })
// export class UsersModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './user.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule, // Add ConfigModule to imports
    JwtModule.registerAsync({
      // Use registerAsync to load secret from ConfigService
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Load secret from environment
        signOptions: { expiresIn: '600s' }, // You can adjust the expiration time as needed
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
