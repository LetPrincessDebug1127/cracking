import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/auth/users.module';
import { AuthModule } from './modules/firebase/firebase.module';
import { PostsModule } from './modules/posts/posts.module';
import { SocketModule } from './modules/notifications/events.module';
import { ScoreModule } from './modules/secretScores/severity.module';
import { SeverityProfileModule } from './modules/severity /severity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    AuthModule,
    PostsModule,
    SocketModule,
    ScoreModule,
    SeverityProfileModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    AuthModule,
    PostsModule,
    SocketModule,
    ScoreModule,
    SeverityProfileModule,
  ],
})
export class AppModule {}
