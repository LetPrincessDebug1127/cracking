import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class idTokenDto {
  @ApiProperty({
    description: 'nhập vào idToken lấy bên kia',
    example: 'abcdez',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
