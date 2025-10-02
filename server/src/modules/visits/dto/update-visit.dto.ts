import { IsDateString, IsString, IsOptional, IsEnum, Matches } from 'class-validator';


/**
 * DTO for updating an existing visit
 * All fields are optional to allow partial updates
 */
export class UpdateVisitDto {
  @IsDateString({}, { message: 'Visit date must be a valid date in YYYY-MM-DD format' })
  @IsOptional()
  visit_date?: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'Visit time must be in HH:MM:SS format' })
  @IsOptional()
  visit_time?: string;

  @IsString({ message: 'Visit reason must be a string' })
  @IsOptional()
  visit_reason?: string;

  @IsEnum(['scheduled', 'completed'], { message: 'Status must be either scheduled or completed' })
  @IsOptional()
  status?: 'scheduled' | 'completed';
}