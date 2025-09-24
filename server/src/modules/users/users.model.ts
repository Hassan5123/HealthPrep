import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Symptom } from '../symptoms/symptoms.model';
import { Visit } from '../visits/visits.model';
import { Medication } from '../medications/medications.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  existing_conditions: string;

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => Symptom, symptom => symptom.user)
  symptoms: Symptom[];

  @OneToMany(() => Visit, visit => visit.user)
  visits: Visit[];

  @OneToMany(() => Medication, medication => medication.user)
  medications: Medication[];
}