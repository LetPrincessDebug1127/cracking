import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'iamsosweet',
    description: 'The username of the user',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsNotEmpty()
  password: string;
}
