import { Visit } from '../visits/visits.model';
export declare class VisitSummary {
    id: number;
    visit_id: number;
    new_diagnosis: string;
    follow_up_instructions: string;
    doctor_recommendations: string;
    patient_concerns_addressed: string;
    patient_concerns_not_addressed: string;
    visit_summary_notes: string;
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    visit: Visit;
}
