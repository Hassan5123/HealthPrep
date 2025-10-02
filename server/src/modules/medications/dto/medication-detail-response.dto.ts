/**
 * Data Transfer Object for detailed medication response
 * Used for getMedicationById
 * Includes all medication fields and provider details if available
 */
export class MedicationDetailResponseDto {
  prescribing_provider_id?: number;
  provider_name?: string;
  provider_type?: string;
  specialty?: string;
  provider_deleted?: boolean;
  medication_name: string;
  dosage: string;
  frequency: string;
  conditions_or_symptoms: string;
  prescribed_date?: string;
  instructions?: string;
  status: 'taking' | 'discontinued';
}