import { IsEmail, IsString, IsNotEmpty, IsISO8601, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for user registration
 * Validates user input for registration process
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  first_name: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  last_name: string;

  @IsISO8601({}, { message: 'Please provide a valid date in ISO format (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  date_of_birth: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @IsString({ message: 'Existing conditions must be a string' })
  @IsOptional()
  existing_conditions?: string;
}