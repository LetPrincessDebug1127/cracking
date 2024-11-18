import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AvailableTask,
  AvailableTaskSchema,
} from '../models/availableTasks.schema';
import {
  StandardDailyTask,
  StandardDailyTaskSchema,
} from '../models/standardTasks.schema';
import { CalendarService } from './taskHistory.service';
import { CalendarController } from './taskHistory.controller';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvailableTask.name, schema: AvailableTaskSchema },
    ]),
    MongooseModule.forFeature([
      { name: StandardDailyTask.name, schema: StandardDailyTaskSchema },
    ]),
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
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
