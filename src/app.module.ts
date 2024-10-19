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
      rootPath: join(__dirname, '..', 'public'), // Đường dẫn tới thư mục public
      serveRoot: '/', // Đường dẫn gốc để phục vụ tệp tĩnh
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        Logger.log(`Connecting to MongoDB at URI: ${uri}`, 'MongoDBConnection');
        return { uri }; // Trả về URI để kết nối
      },
      inject: [ConfigService], // Tiêm ConfigService
    }),
    UsersModule, // Đăng ký UsersModule
  ],
  controllers: [AppController], // Đăng ký controllers
  providers: [AppService], // Đăng ký providers
})
export class AppModule {}
