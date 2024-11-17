import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvailableTask } from '../models/availableTasks.schema';
import { CreateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { UpdateAvailableTaskDto } from '../dto.all.ts/availableTasks.dto';
import { Types } from 'mongoose';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(AvailableTask.name)
    private readonly taskModel: Model<AvailableTask>,
  ) {}

  async createTask(taskData: CreateAvailableTaskDto) {
    return await this.taskModel.create(taskData);
  }

  async getAllTasks() {
    return await this.taskModel.find();
  }

  async updateTask(taskId: Types.ObjectId, taskData: UpdateAvailableTaskDto) {
    return await this.taskModel.updateOne({ _id: taskId }, taskData);
  }

  async deleteTask(taskId: Types.ObjectId) {
    const result = await this.taskModel.deleteOne({ _id: taskId });
    if (result.deletedCount === 0) {
      throw new Error('Task not found or already deleted');
    }
    return { message: 'Task successfully deleted' };
  }
}
