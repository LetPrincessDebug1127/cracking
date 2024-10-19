import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // cái code how to kết nối mongo cloud này mình bê trên docs qua
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        Logger.log(`Connecting to MongoDB at URI: ${uri}`, 'MongoDBConnection');
        return { uri };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
})
export class AppModule {}
