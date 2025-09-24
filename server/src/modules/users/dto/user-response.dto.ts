/**
 * Data Transfer Object for user responses
 * Standardizes the user data returned in API responses
 */
export class UserResponseDto {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  phone?: string | null;
  existing_conditions?: string | null;
  created_at: Date;
  updated_at: Date;
  
  // Explicitly omitting for security: password_hash, soft_deleted_at
}

/**
 * Data Transfer Object for authentication responses
 * Includes user data and JWT token
 */
export class AuthResponseDto {
  user: UserResponseDto;
  token: string;
}