import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvailableTask } from '../models/availableTasks.schema';
import { CreateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { UpdateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { SeverityProfile } from '../models/severity.profile';
import { Types } from 'mongoose';
import { StandardDailyTask } from '../models/standardTasks.schema';
import { JwtAuthGuard } from '../jwtstrategy/jwt-auth.guard';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(AvailableTask.name)
    private readonly taskModel: Model<AvailableTask>,
    @InjectModel(SeverityProfile.name)
    private readonly severityProfileModel: Model<SeverityProfile>,
    @InjectModel(StandardDailyTask.name)
    private readonly standardTasksModel: Model<StandardDailyTask>,
  ) {}

  // hàm để client click vào task thì nó sẽ đổi status task và tính điểm, giảm severityPercentage nếu có
  async completeTaskStatus(
    userId: Types.ObjectId,
    taskId: Types.ObjectId,
    completed: string,
  ) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task không tồn tại');

    if (completed === 'completed') {
      // Tạo task hoàn thành
      await this.standardTasksModel.create({
        user_id: userId,
        task_id: taskId,
        completed,
      });

      // Tăng sunPoints
      const severityProfile = await this.severityProfileModel.findOneAndUpdate(
        { user_id: userId },
        { $inc: { sunPoints: 1 } },
        { new: true }, // Trả về tài liệu đã cập nhật
      );

      // Kiểm tra nếu đạt 30 sunPoints, giảm severityPercentage
      if (severityProfile.sunPoints === 30) {
        severityProfile.sunPoints = 0;
        severityProfile.severityPercentage -= 1;
        await severityProfile.save();
      }
    }

    return { message: `Task status cập nhật thành ${completed}.` };
  }

  // async getTaskStatus(userId: string, taskId: string): Promise<string> {
  //   const task = await this.taskModel.findOne({ user_id: userId, task_id: taskId });
  //   return task ? task.completed : 'todo';  // Return 'todo' if no task found
  // }
}
