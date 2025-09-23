import { User } from '../users/users.model';
import { Provider } from '../providers/providers.model';
import { Visit } from '../visits/visits.model';
export declare class Medication {
    id: number;
    user_id: number;
    prescribing_provider_id: number;
    prescribed_during_visit_id: number;
    medication_name: string;
    dosage: string;
    frequency: string;
    conditions_or_symptoms: string;
    prescribed_date: Date;
    instructions: string;
    status: 'taking' | 'discontinued';
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    user: User;
    prescribing_provider: Provider;
    prescribed_during_visit: Visit;
}
