/**
 * Data Transfer Object for medication list responses
 * Used for getAllMedications, getActiveMedications, getDiscontinuedMedications
 * Only includes non-null fields
 */
export class MedicationListResponseDto {
  prescribing_provider_id?: number;
  provider_name?: string;
  provider_deleted?: boolean;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  status: 'taking' | 'discontinued';
}