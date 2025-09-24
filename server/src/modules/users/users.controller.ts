import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';

/**
 * Controller handling user-related endpoints
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint for user registration
   * @param registerDto User registration data
   * @returns Newly created user data and JWT token
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.usersService.register(registerDto);
  }

  /**
   * Endpoint for user login
   * @param loginDto User login credentials
   * @returns User data and JWT token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.usersService.login(loginDto);
  }
}