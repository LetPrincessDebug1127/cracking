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
    example:'newpassword123@gmail.com',
    description:
      'email',
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
