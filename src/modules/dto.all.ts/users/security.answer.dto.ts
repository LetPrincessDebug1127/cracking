import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SecurityAnswerUserDto {
  @ApiProperty({
    example: 'iamsosweet',
    description: 'Tên đăng nhập',
  })
  @IsString()
  @IsNotEmpty()  username: string;
}
