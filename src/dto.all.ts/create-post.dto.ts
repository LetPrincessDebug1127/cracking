import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'nhập vào content',
    example: 'Hôm nay code rất vui',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
