import { IsString, IsOptional } from 'class-validator';


/**
 * DTO for updating visit preparation record
 * All fields are optional to allow partial updates
 */
export class UpdateVisitPrepDto {
  @IsString({ message: 'Questions to ask must be a string' })
  @IsOptional()
  questions_to_ask?: string;

  @IsString({ message: 'Symptoms to discuss must be a string' })
  @IsOptional()
  symptoms_to_discuss?: string;

  @IsString({ message: 'Conditions to discuss must be a string' })
  @IsOptional()
  conditions_to_discuss?: string;

  @IsString({ message: 'Medications to discuss must be a string' })
  @IsOptional()
  medications_to_discuss?: string;

  @IsString({ message: 'Goals for visit must be a string' })
  @IsOptional()
  goals_for_visit?: string;

  @IsString({ message: 'Prep summary notes must be a string' })
  @IsOptional()
  prep_summary_notes?: string;
}