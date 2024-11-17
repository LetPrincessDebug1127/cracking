import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StandardDailyTaskController } from './handle.tasks.controller';
import { TaskService } from './handle.tasks';
import { TaskAdminService } from './tasks.management.service';
import {
  AvailableTask,
  AvailableTaskSchema,
} from '../models/availableTasks.schema';
import {
  StandardDailyTask,
  StandardDailyTaskSchema,
} from '../models/standardTasks.schema';
import {
  SeverityProfile,
  SeveritySchema,
} from '../../modules/models/severity.profile';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeverityProfile.name, schema: SeveritySchema },
    ]),
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
  controllers: [StandardDailyTaskController],
  providers: [TaskService, TaskAdminService],
  exports: [TaskService, TaskAdminService],
})
export class TasksManagementModule {}
