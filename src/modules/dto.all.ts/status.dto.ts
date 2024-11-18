import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaskStatusDto {
  @ApiProperty({
    description: 'The status of the task (e.g., completed, pending)',
    example: 'completed',
  })
  @IsString()
  @IsIn(['todo', 'completed'], {
    message: 'Trạng thái phải là todo hoặc completed',
  })
  status: string;
}
