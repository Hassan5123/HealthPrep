/**
 * Response DTO for symptom list endpoints (get_all, get_active, get_resolved)
 * Returns only essential fields for list views
 */
export class SymptomListResponseDto {
  symptom_name: string;
  severity: number;
  onset_date: string;
  end_date?: string | null;
  location_on_body?: string | null;
  status?: string; // Only included in get_all_symptoms
}