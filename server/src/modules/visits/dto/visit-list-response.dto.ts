/**
 * Response DTO for visit list endpoints (get_all_visits)
 * Includes provider details
 */
export class VisitListResponseDto {
  provider_id: number;
  provider_name: string;
  provider_type: string;
  specialty?: string | null;
  visit_date: string;
  visit_time?: string | null;
  status: string;
}


/**
 * Response DTO for upcoming/completed visit lists
 * Same as VisitListResponseDto but without status field
 */
export class VisitScheduledListResponseDto {
  provider_id: number;
  provider_name: string;
  provider_type: string;
  specialty?: string | null;
  visit_date: string;
  visit_time?: string | null;
}