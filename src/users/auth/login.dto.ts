// export class LoginUserDto {
//   username: string;
//   password: string;
// } // nêú không dùng swagger thì dto như v v
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Tên đăng nhập của người dùng',
    example: 'user123',
  })
  username: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
  })
  password: string;
}
