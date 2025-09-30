import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './users.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto, AuthResponseDto } from './dto/user-response.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * Service handling user-related operations
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user
   * @param registerDto User registration data
   * @returns The newly created user and JWT token
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, ...userData } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email,
      password_hash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      date_of_birth: userData.date_of_birth,
      phone: userData.phone,
      existing_conditions: userData.existing_conditions,
      soft_deleted_at: null
    });

    // Save user to database
    const savedUser = await this.usersRepository.save(user);

    // Generate JWT token
    const payload = { sub: savedUser.id, email: savedUser.email };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    // Format response
    const { password_hash: _, soft_deleted_at: __, ...userResponse } = savedUser;
    return {
      user: userResponse as UserResponseDto,
      token
    };
  }

  /**
   * Authenticates a user
   * @param loginDto User login credentials
   * @returns User data and JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is soft deleted
    if (user.soft_deleted_at !== null) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    // Format response
    const { password_hash: _, soft_deleted_at: __, ...userResponse } = user;
    return {
      user: userResponse as UserResponseDto,
      token
    };
  }

  /**
   * Updates a user's profile information
   * @param userId The ID of the user to update
   * @param updateProfileDto The user profile data to update
   * @returns The updated user data
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    // Find the user by ID
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is soft deleted
    if (user.soft_deleted_at !== null) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    // If user is changing email, check if new email already exists
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: updateProfileDto.email } });
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Update user properties
    if (updateProfileDto.email) user.email = updateProfileDto.email;
    if (updateProfileDto.first_name) user.first_name = updateProfileDto.first_name;
    if (updateProfileDto.last_name) user.last_name = updateProfileDto.last_name;
    if (updateProfileDto.date_of_birth) user.date_of_birth = updateProfileDto.date_of_birth;
    if (updateProfileDto.phone !== undefined) user.phone = updateProfileDto.phone;
    if (updateProfileDto.existing_conditions !== undefined) user.existing_conditions = updateProfileDto.existing_conditions;

    // Save updated user
    const updatedUser = await this.usersRepository.save(user);

    // Format response (exclude sensitive fields)
    const { password_hash, soft_deleted_at, ...userResponse } = updatedUser;
    return userResponse as UserResponseDto;
  }

  /**
   * Retrieves a user's profile information
   * @param userId The ID of the user requesting their profile
   * @returns The user profile data (excluding sensitive fields)
   */
  async getProfile(userId: number): Promise<GetProfileResponseDto> {
    // Find the user by ID
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is soft deleted
    if (user.soft_deleted_at !== null) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    // Return only the necessary fields
    return {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      existing_conditions: user.existing_conditions
    };
  }

  /**
   * Deactivates a user's account (soft delete)
   * @param userId The ID of the user to deactivate
   * @returns The deactivated user data
   */
  async deactivateAccount(userId: number): Promise<{ success: boolean, message: string }> {
    // Find the user by ID
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already soft deleted
    if (user.soft_deleted_at !== null) {
      return { success: false, message: 'Account is already deactivated' };
    }

    // Set soft delete timestamp
    user.soft_deleted_at = new Date();

    // Save updated user
    await this.usersRepository.save(user);

    return { 
      success: true, 
      message: 'Account deactivated successfully'
    };
  }
}