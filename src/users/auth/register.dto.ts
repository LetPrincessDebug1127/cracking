import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'iamsosweet',
    description: 'Tên đăng nhập',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 19950701,
    description: 'Câu trả lời để khôi phục tài khoản khi quên mật khẩu',
  })
  @IsNumber()
  @IsNotEmpty()
  securityAnswer: number;
}
