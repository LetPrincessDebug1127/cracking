import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateAvailableTaskDto {
  @ApiProperty({
    description: 'The kind of the available task',
    enum: ['food', 'beverage'],
    example: 'food',
  })
  @IsString()
  kind: string;

  @ApiProperty({
    description:
      'The description of the available task, containing title and content',
    type: String,
    example: 'ăn cá thu',
  })
  description: string;

  @ApiProperty({
    description: 'The difficulty level of the task',
    enum: ['standard', 'mild'],
    example: 'standard',
  })
  @IsEnum(['standard', 'mild'])
  difficulty: string;

  @ApiProperty({
    description: 'The points awarded for completing the task',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  points?: number;
}

export class UpdateAvailableTaskDto {
  @ApiProperty({
    description: 'The kind of the available task',
    enum: ['food', 'beverage'],
    example: 'food',
    required: false, // Optional field for update
  })
  @IsOptional()
  @IsString()
  kind?: string;

  @ApiProperty({
    description:
      'The description of the available task, containing title and content',
    type: String,
    example: 'ăn cá thu',
    required: false, // Optional field for update
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The difficulty level of the task',
    enum: ['standard', 'mild'],
    example: 'standard',
    required: false, // Optional field for update
  })
  @IsOptional()
  @IsEnum(['standard', 'mild'])
  difficulty?: string;

  @ApiProperty({
    description: 'The points awarded for completing the task',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  points?: number;
}
