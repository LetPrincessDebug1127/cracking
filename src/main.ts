import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Chuyển đổi kiểu dữ liệu
      whitelist: true, // Tự động loại bỏ các thuộc tính không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Trả về lỗi nếu có thuộc tính không được định nghĩa
      forbidUnknownValues: true, // Trả về lỗi nếu giá trị không hợp lệ
    }),
  );
  const configS = new DocumentBuilder()

    .setTitle('User API')
    .setDescription('API for user management')
    .setVersion('1.0')
    .addTag('users')
    .addBearerAuth()
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            openid: 'OpenID Connect',
            email: 'Access to your email address',
            profile: 'Access to your profile information',
          },
        },
      },
    })
    .build();
  const document = SwaggerModule.createDocument(app, configS);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(5656);
}
bootstrap();
