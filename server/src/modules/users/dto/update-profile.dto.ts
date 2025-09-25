import { IsEmail, IsString, IsOptional, IsISO8601, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for user profile updates
 * Validates user input for profile update process
 */
export class UpdateProfileDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  first_name?: string;

  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  last_name?: string;

  @IsISO8601({}, { message: 'Please provide a valid date in ISO format (YYYY-MM-DD)' })
  @IsOptional()
  date_of_birth?: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @IsString({ message: 'Existing conditions must be a string' })
  @IsOptional()
  existing_conditions?: string;
}