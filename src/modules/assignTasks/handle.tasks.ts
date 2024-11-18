import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, ClientSession, Connection } from 'mongoose';
import { AvailableTask } from '../models/availableTasks.schema';
import { CreateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { UpdateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { SeverityProfile } from '../models/severity.profile';
import { Types } from 'mongoose';
import { StandardDailyTask } from '../models/standardTasks.schema';
import { JwtAuthGuard } from '../jwtstrategy/jwt-auth.guard';
import { TaskStatusDto } from '../dto.all.ts/status.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(AvailableTask.name)
    private readonly taskModel: Model<AvailableTask>,
    @InjectModel(SeverityProfile.name)
    private readonly severityProfileModel: Model<SeverityProfile>,
    @InjectModel(StandardDailyTask.name)
    private readonly standardTasksModel: Model<StandardDailyTask>,
    @InjectConnection() private connection: Connection,
  ) {}

  // hàm để client click vào task thì nó sẽ đổi status task và tính điểm, giảm severityPercentage nếu có
  async completeTaskStatus(
    userId: Types.ObjectId,
    taskId: Types.ObjectId,
    taskStatusDto: TaskStatusDto,
  ) {
    // Lấy session để đảm bảo transaction
    const session: ClientSession = await this.connection.startSession();
    session.startTransaction();

    try {
      // Kiểm tra task tồn tại
      const task = await this.taskModel.findById(taskId).session(session);
      if (!task) throw new NotFoundException('Task không tồn tại');

      // Lấy trạng thái từ DTO
      const { status } = taskStatusDto;

      if (status === 'completed') {
        // Tạo record task hoàn thành
        const standardTask = await this.standardTasksModel.create(
          [
            {
              user_id: userId,
              task_id: taskId,
              status,
            },
          ],
          { session },
        );

        console.log('Task completed:', standardTask);

        // Tăng sunPoints
        const severityProfile =
          await this.severityProfileModel.findOneAndUpdate(
            { user_id: userId },
            { $inc: { sunPoints: 1 } },
            { new: true, session },
          );

        if (!severityProfile) {
          throw new NotFoundException('Severity profile không tồn tại');
        }

        console.log('Updated severity profile:', severityProfile);

        // Kiểm tra nếu đạt 30 sunPoints thì giảm severityPercentage
        if (severityProfile.sunPoints >= 30) {
          severityProfile.sunPoints = 0;
          severityProfile.severityPercentage = Math.max(
            0,
            severityProfile.severityPercentage - 0.5,
          );
          await severityProfile.save({ session });
          console.log('Reduced severity percentage');
        }
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return { message: `Task status cập nhật thành ${status}.` };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await session.abortTransaction();
      session.endSession();
      console.error('Error updating task status:', error);
      throw error;
    }
  }
}
