import { IsEmail, IsString, IsOptional, IsISO8601, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for user profile updates
 * Validates user input for profile update process
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  first_name?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  last_name?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Please provide a valid date in ISO format (YYYY-MM-DD)' })
  date_of_birth?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Existing conditions must be a string' })
  existing_conditions?: string;
}