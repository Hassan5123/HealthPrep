import { User } from '../users/users.model';
import { Visit } from '../visits/visits.model';
export declare class VisitPrep {
    id: number;
    user_id: number;
    visit_id: number;
    questions_for_doctor: string;
    symptoms_to_discuss: string;
    medication_issues: string;
    other_notes: string;
    status: 'draft' | 'completed';
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    user: User;
    visit: Visit;
}
