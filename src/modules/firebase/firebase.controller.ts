// auth.controller.ts
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { FirebaseAdminService } from './firebase.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { idTokenDto } from './firebase_token-dto';

@ApiTags('Firebase Login W Google')
@Controller('auth')
export class AuthController {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  @Post('verify-token-google')
  @ApiOperation({ summary: 'Verify Firebase ID Token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid, returns user data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    description: 'Điền idToken đăng nhập bên firebase qua, xem trong log',
    type: idTokenDto,
  })
  async verifyToken(@Body('idToken') idToken: string) {
    if (!idToken) {
      throw new BadRequestException('ID Token is missing');
    }
    try {
      const userData = await this.firebaseAdminService.verifyIdToken(idToken);
      return { message: 'Token verified successfully', userData };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
