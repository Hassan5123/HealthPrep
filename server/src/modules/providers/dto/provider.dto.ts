import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


export class CreateProviderDto {
  @IsNotEmpty()
  @IsString()
  provider_name: string;

  @IsNotEmpty()
  @IsEnum(['personal_doctor', 'walk_in_clinic', 'emergency_room'])
  provider_type: 'personal_doctor' | 'walk_in_clinic' | 'emergency_room';

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  office_address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProviderDto {
  @IsNotEmpty()
  @IsString()
  provider_name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  office_address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for provider response (getting all Providers) with minimal fields
 */
export class ProviderSummaryDto {
  id: number;
  provider_name: string;
  provider_type: string;
  specialty: string | null;
}

/**
 * DTO for detailed provider response (getting a specific Provider)
 */
export class ProviderDetailDto {
  id: number;
  provider_name: string;
  provider_type: string;
  specialty: string | null;
  phone: string;
  email: string | null;
  office_address: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}