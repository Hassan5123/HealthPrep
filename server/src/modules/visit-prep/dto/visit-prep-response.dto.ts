/**
 * Response DTO for visit preparation record
 */
export class VisitPrepResponseDto {
  questions_to_ask?: string | null;
  symptoms_to_discuss?: string | null;
  conditions_to_discuss?: string | null;
  medications_to_discuss?: string | null;
  goals_for_visit?: string | null;
  prep_summary_notes: string;
}


/**
 * Response DTO for user existing conditions
 */
export class UserConditionsResponseDto {
  has_conditions: boolean;
  conditions?: string[];
}