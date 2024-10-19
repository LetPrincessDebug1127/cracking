import { Module, Logger } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/auth/users.module'; // Đảm bảo đường dẫn đúng

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Tải cấu hình từ file .env
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        Logger.log(`Connecting to MongoDB at URI: ${uri}`, 'MongoDBConnection');
        return { uri };
      },
      inject: [ConfigService],
    }),
    UsersModule, // Đăng ký UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
