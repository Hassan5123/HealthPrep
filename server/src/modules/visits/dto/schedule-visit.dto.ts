import { IsNotEmpty, IsString, IsDateString, IsInt, IsOptional, Matches } from 'class-validator';


/**
 * DTO for scheduling a new visit
 */
export class ScheduleVisitDto {
  @IsInt({ message: 'Provider ID must be an integer' })
  @IsNotEmpty({ message: 'Provider ID is required' })
  provider_id: number;

  @IsDateString({}, { message: 'Visit date must be a valid date in YYYY-MM-DD format' })
  @IsNotEmpty({ message: 'Visit date is required' })
  visit_date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'Visit time must be in HH:MM:SS format' })
  @IsOptional()
  visit_time?: string;

  @IsString({ message: 'Visit reason must be a string' })
  @IsNotEmpty({ message: 'Visit reason is required' })
  visit_reason: string;
}