/**
 * Data Transfer Object for visit summary responses
 * Only includes non-null optional fields
 */
export class VisitSummaryResponseDto {
  new_diagnosis?: string;
  follow_up_instructions?: string;
  doctor_recommendations?: string;
  patient_concerns_addressed?: string;
  patient_concerns_not_addressed?: string;
  visit_summary_notes: string;
}