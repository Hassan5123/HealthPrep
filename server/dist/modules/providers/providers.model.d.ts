import { Visit } from '../visits/visits.model';
import { Medication } from '../medications/medications.model';
export declare class Provider {
    id: number;
    provider_name: string;
    provider_type: 'personal_doctor' | 'walk_in_clinic' | 'emergency_room' | 'urgent_care' | 'specialist';
    specialty: string;
    phone: string;
    email: string;
    office_address: string;
    notes: string;
    soft_deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
    visits: Visit[];
    medications: Medication[];
}
