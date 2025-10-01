import { IsString, IsNotEmpty, IsInt, Min, Max, IsISO8601, IsOptional, MaxLength, IsEnum } from 'class-validator';

/**
 * Data Transfer Object for adding a new symptom
 * Validates user input for symptom creation
 */
export class AddSymptomDto {
  @IsString({ message: 'Symptom name must be a string' })
  @IsNotEmpty({ message: 'Symptom name is required' })
  @MaxLength(200, { message: 'Symptom name cannot exceed 200 characters' })
  symptom_name: string;

  @IsInt({ message: 'Severity must be an integer' })
  @IsNotEmpty({ message: 'Severity is required' })
  @Min(1, { message: 'Severity must be at least 1' })
  @Max(10, { message: 'Severity cannot exceed 10' })
  severity: number;

  @IsISO8601({}, { message: 'Please provide a valid onset date in ISO format (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Onset date is required' })
  onset_date: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsISO8601({}, { message: 'Please provide a valid end date in ISO format (YYYY-MM-DD)' })
  @IsOptional()
  end_date?: string;

  @IsString({ message: 'Location on body must be a string' })
  @IsOptional()
  @MaxLength(200, { message: 'Location on body cannot exceed 200 characters' })
  location_on_body?: string;

  @IsString({ message: 'Triggers must be a string' })
  @IsOptional()
  triggers?: string;

  @IsString({ message: 'Related condition must be a string' })
  @IsOptional()
  related_condition?: string;

  @IsString({ message: 'Related medications must be a string' })
  @IsOptional()
  related_medications?: string;

  @IsString({ message: 'Medications taken must be a string' })
  @IsOptional()
  medications_taken?: string;

  @IsEnum(['active', 'resolved'], { message: 'Status must be either active or resolved' })
  @IsNotEmpty({ message: 'Status is required' })
  status: 'active' | 'resolved';
}