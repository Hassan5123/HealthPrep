import { Symptom } from '../symptoms/symptoms.model';
import { Visit } from '../visits/visits.model';
import { Medication } from '../medications/medications.model';
export declare class User {
    id: number;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    phone: string;
    existing_conditions: string;
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    symptoms: Symptom[];
    visits: Visit[];
    medications: Medication[];
}
