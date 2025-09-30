import { Controller, Post, Put, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../../common/middlewares/auth-middleware';
import { UsersService } from './users.service';
import { RegisterDto, LoginDto, UpdateProfileDto, AuthResponseDto, UserResponseDto, GetProfileResponseDto } from './dto';

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

  /**
   * Endpoint for getting user profile
   * Protected by JWT authentication
   * @param req Request object containing authenticated user
   * @returns User profile data (email, first_name, last_name, date_of_birth, phone, existing_conditions)
   */
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req): Promise<GetProfileResponseDto> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.usersService.getProfile(userId);
  }

  /**
   * Endpoint for updating user profile
   * Protected by JWT authentication
   * @param updateProfileDto User profile update data
   * @returns Updated user data
   */
  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    // Extract user ID from JWT payload (stored as 'sub')
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Endpoint for deactivating user account (soft delete)
   * @param req Request object containing authenticated user
   * @returns Success message
   */
  @Post('deactivate')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return await this.usersService.deactivateAccount(userId);
  }
}