import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SecurityAnswerUserDto {
  @ApiProperty({
    example: 'iamsosweet',
    description: 'Tên đăng nhập',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 22,
    description:
      'Ngày sinh người thân yêu để khôi phục tài khoản khi quên mật khẩu ?',
  })
  @IsNumber()
  @IsNotEmpty()
  securityAnswer: number;
}
