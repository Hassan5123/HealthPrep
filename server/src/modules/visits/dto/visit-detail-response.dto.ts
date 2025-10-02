/**
 * Response DTO for single visit detail (get_visit)
 * Includes detailed provider information
 */
export class VisitDetailResponseDto {
  provider_id: number;
  provider_name: string;
  provider_type: string;
  specialty?: string | null;
  phone: string;
  office_address?: string | null;
  visit_date: string;
  visit_time?: string | null;
  visit_reason: string;
  status: string;
}