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
export class CalendarService {
  constructor(
    @InjectModel(AvailableTask.name)
    private readonly taskModel: Model<AvailableTask>,
    // @InjectModel(SeverityProfile.name)
    // private readonly severityProfileModel: Model<SeverityProfile>,
    @InjectModel(StandardDailyTask.name)
    private readonly standardTasksModel: Model<StandardDailyTask>,
  ) {}

  async getTasksByUserAndDate(
    userId: Types.ObjectId,
    taskDate: Date,
  ): Promise<string[]> {
    const startOfDay = new Date(taskDate.setHours(0, 0, 0, 0)); // Set giờ là 00:00:00
    const endOfDay = new Date(taskDate.setHours(23, 59, 59, 999)); // Set giờ là 23:59:59

    // Tìm các task theo user_id và createdAt nằm trong khoảng thời gian ngày
    const tasks = await this.standardTasksModel
      .find({
        user_id: userId,
        createdAt: { $gte: startOfDay, $lt: endOfDay }, // Dùng createdAt thay vì task_date
      })
      .populate<{ task_id: AvailableTask }>('task_id', 'description')
      .exec();

    // Trả về mảng các description từ task_id
    return tasks.map((task) => task.task_id.description);
  }
}

// Khi bạn làm việc với createdAt (là một timestamp),
// nó không có thông tin về múi giờ mà được lưu trữ dưới dạng UTC.
// Điều này có nghĩa là giờ UTC sẽ khác nhau tùy thuộc vào múi giờ của người dùng.
