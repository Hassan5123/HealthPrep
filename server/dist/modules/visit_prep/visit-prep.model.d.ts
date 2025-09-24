import { Visit } from '../visits/visits.model';
export declare class VisitPrep {
    id: number;
    visit_id: number;
    questions_to_ask: string;
    symptoms_to_discuss: string;
    conditions_to_discuss: string;
    medications_to_discuss: string;
    goals_for_visit: string;
    prep_summary_notes: string;
    soft_deleted_at: Date | null;
    last_modified: Date;
    created_at: Date;
    visit: Visit;
}
