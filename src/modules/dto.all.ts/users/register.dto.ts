import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

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
    example: 'shisoremedy@gmail.com',
    description: 'Gmail của bạn',
  })
  @IsEmail()
  @IsNotEmpty()
  securityAnswer: string;
}
