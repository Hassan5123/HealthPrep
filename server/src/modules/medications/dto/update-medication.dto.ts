import { IsString, IsInt, IsOptional, IsISO8601, MaxLength } from 'class-validator';


/**
 * Data Transfer Object for updating an existing medication
 * All fields are optional since users can update specific fields
 */
export class UpdateMedicationDto {
  @IsInt({ message: 'Prescribing provider ID must be an integer' })
  @IsOptional()
  prescribing_provider_id?: number;

  @IsString({ message: 'Medication name must be a string' })
  @MaxLength(200, { message: 'Medication name cannot exceed 200 characters' })
  @IsOptional()
  medication_name?: string;

  @IsString({ message: 'Dosage must be a string' })
  @MaxLength(100, { message: 'Dosage cannot exceed 100 characters' })
  @IsOptional()
  dosage?: string;

  @IsString({ message: 'Frequency must be a string' })
  @MaxLength(100, { message: 'Frequency cannot exceed 100 characters' })
  @IsOptional()
  frequency?: string;

  @IsString({ message: 'Conditions or symptoms must be a string' })
  @IsOptional()
  conditions_or_symptoms?: string;

  @IsISO8601({}, { message: 'Please provide a valid prescribed date in ISO format (YYYY-MM-DD)' })
  @IsOptional()
  prescribed_date?: string;

  @IsString({ message: 'Instructions must be a string' })
  @IsOptional()
  instructions?: string;

  @IsString({ message: 'Status must be a string' })
  @IsOptional()
  status?: 'taking' | 'discontinued';
}