import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'; // Import Swagger decorators
import { UsersService } from './users.service';
import { JwtAuthGuard } from './jwt-auth.guard'; // Import the JWT guard
import { CreateUserDto } from './register.dto'; // Import DTOs
import { LoginUserDto } from './login.dto';

@ApiTags('users') // Swagger tag for grouping under "users"
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Swagger operation summary
  @ApiResponse({ status: 201, description: 'User successfully registered' }) // Swagger response
  @ApiResponse({ status: 400, description: 'Bad request' }) // Swagger response for error
  @ApiBody({ type: CreateUserDto }) // Swagger body specification
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' }) // Swagger operation summary
  @ApiResponse({ status: 200, description: 'User successfully logged in' }) // Swagger response
  @ApiResponse({ status: 401, description: 'Unauthorized' }) // Swagger response for error
  @ApiBody({ type: LoginUserDto }) // Swagger body specification
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );

    // If user is not found or password is incorrect, throw UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return user; // On success, return the user or token
  }
  @UseGuards(JwtAuthGuard) // JWT Authentication guard
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers() {
    return this.usersService.getAllUsers(); // Gọi phương thức từ UsersService
  }
}
