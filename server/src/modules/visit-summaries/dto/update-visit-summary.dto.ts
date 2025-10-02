import { IsString, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for updating an existing visit summary
 * All fields are optional since users can update specific fields
 */
export class UpdateVisitSummaryDto {
  @IsString({ message: 'New diagnosis must be a string' })
  @IsOptional()
  new_diagnosis?: string;

  @IsString({ message: 'Follow-up instructions must be a string' })
  @IsOptional()
  follow_up_instructions?: string;

  @IsString({ message: 'Doctor recommendations must be a string' })
  @IsOptional()
  doctor_recommendations?: string;

  @IsString({ message: 'Patient concerns addressed must be a string' })
  @IsOptional()
  patient_concerns_addressed?: string;

  @IsString({ message: 'Patient concerns not addressed must be a string' })
  @IsOptional()
  patient_concerns_not_addressed?: string;

  @IsString({ message: 'Visit summary notes must be a string' })
  @IsOptional()
  visit_summary_notes?: string;
}