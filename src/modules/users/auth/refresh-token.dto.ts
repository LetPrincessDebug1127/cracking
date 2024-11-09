import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'nhập vào refresh token, tạo ra rf token mới và access token mới',
    example: 'abcdez',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
