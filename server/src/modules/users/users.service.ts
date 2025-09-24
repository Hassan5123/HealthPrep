import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from './users.model';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';

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
      date_of_birth: new Date(userData.date_of_birth),
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
}