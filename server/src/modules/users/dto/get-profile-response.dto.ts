/**
 * Data Transfer Object for get profile responses
 * Returns only the user profile fields needed by the frontend
 */
export class GetProfileResponseDto {
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string | null;
  existing_conditions?: string | null;
}