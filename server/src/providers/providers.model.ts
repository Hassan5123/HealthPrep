import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Visit } from '../visits/visits.model';
import { Medication } from '../medications/medications.model';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  @Index()
  provider_name: string;

  @Column({
    type: 'enum',
    enum: ['personal_doctor', 'walk_in_clinic', 'emergency_room', 'urgent_care', 'specialist'],
    default: 'personal_doctor'
  })
  @Index()
  provider_type: 'personal_doctor' | 'walk_in_clinic' | 'emergency_room' | 'urgent_care' | 'specialist';

  @Column({ length: 100, nullable: true })
  @Index()
  specialty: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  office_address: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => Visit, visit => visit.provider)
  visits: Visit[];

  @OneToMany(() => Medication, medication => medication.prescribing_provider)
  medications: Medication[];
}