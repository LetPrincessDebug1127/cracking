import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//mình dùng dto này cho content của comment luôn
export class CreatePostDto {
  @ApiProperty({
    description: 'nhập vào content',
    example: 'Hôm nay code rất vui',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
