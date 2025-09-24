import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.model';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  prescribing_provider_id: number;

  @Column({ nullable: true })
  prescribed_during_visit_id: number;

  @Column({ length: 200 })
  medication_name: string;

  @Column({ length: 100 })
  dosage: string;

  @Column({ length: 100 })
  frequency: string;

  @Column('text')
  conditions_or_symptoms: string;

  @Column({ type: 'date', nullable: true })
  prescribed_date: Date;

  @Column('text', { nullable: true })
  instructions: string;

  @Column({
    type: 'enum',
    enum: ['taking', 'discontinued'],
    default: 'taking'
  })
  status: 'taking' | 'discontinued';

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.medications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne('Provider', 'medications', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'prescribing_provider_id' })
  prescribing_provider: any;

  @ManyToOne('Visit', 'medications', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'prescribed_during_visit_id' })
  prescribed_during_visit: any;
}