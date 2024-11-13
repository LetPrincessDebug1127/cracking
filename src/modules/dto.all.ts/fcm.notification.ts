import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ description: 'The device token for the push notification' })
  token: string;

  @ApiProperty({ description: 'The title of the notification' })
  title: string;

  @ApiProperty({ description: 'The body content of the notification' })
  body: string;
}
