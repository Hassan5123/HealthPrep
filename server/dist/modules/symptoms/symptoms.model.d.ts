import { User } from '../users/users.model';
export declare class Symptom {
    id: number;
    user_id: number;
    symptom_name: string;
    severity: number;
    onset_date: Date;
    description: string;
    end_date: Date;
    location_on_body: string;
    triggers: string;
    related_condition: string;
    related_medications: string;
    medications_taken: string;
    status: 'active' | 'resolved' | 'monitoring';
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    user: User;
}
