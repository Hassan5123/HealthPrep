import { User } from '../users/users.model';
import { Provider } from '../providers/providers.model';
import { Medication } from '../medications/medications.model';
import { VisitSummary } from '../visit_summaries/visit-summaries.model';
import { VisitPrep } from '../visit_prep/visit-prep.model';
export declare class Visit {
    id: number;
    user_id: number;
    provider_id: number;
    visit_date: Date;
    visit_time: string;
    visit_reason: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    user: User;
    provider: Provider;
    medications: Medication[];
    summary: VisitSummary;
    prep: VisitPrep;
}
