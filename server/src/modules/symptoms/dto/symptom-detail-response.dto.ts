/**
 * Response DTO for symptom detail endpoint (get_symptom)
 * Returns comprehensive symptom information
 */
export class SymptomDetailResponseDto {
  symptom_name: string;
  severity: number;
  onset_date: string;
  description?: string | null;
  end_date?: string | null;
  location_on_body?: string | null;
  triggers?: string | null;
  related_condition?: string | null;
  related_medications?: string | null;
  medications_taken?: string | null;
  status: string;
}