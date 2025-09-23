import { Visit } from '../visits/visits.model';
export declare class VisitSummary {
    id: number;
    visit_id: number;
    diagnoses: string;
    treatment_plan: string;
    prescriptions_info: string;
    followup_instructions: string;
    doctor_notes: string;
    soft_deleted_at: Date | null;
    last_modified: Date;
    created_at: Date;
    visit: Visit;
}
