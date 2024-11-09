import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newpassword123',
    description: 'Mật khẩu mới',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: 22,
    description:
      'Ngày sinh người thân yêu để khôi phục tài khoản khi quên mật khẩu ?',
  })
  @IsNumber()
  @IsNotEmpty()
  securityAnswer: number;

  @ApiProperty({
    example: 'username123',
    description: 'Tên đăng nhập',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}
