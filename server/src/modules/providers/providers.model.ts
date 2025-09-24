import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  provider_name: string;

  @Column({
    type: 'enum',
    enum: ['personal_doctor', 'walk_in_clinic', 'emergency_room', 'urgent_care', 'specialist'],
    default: 'personal_doctor'
  })
  provider_type: 'personal_doctor' | 'walk_in_clinic' | 'emergency_room' | 'urgent_care' | 'specialist';

  @Column({ length: 100, nullable: true })
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
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany('Visit', 'provider')
  visits: any[];

  @OneToMany('Medication', 'prescribing_provider')
  medications: any[];
}