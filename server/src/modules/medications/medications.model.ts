import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.model';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ nullable: true })
  prescribing_provider_id: number;

  @Column({ length: 200, nullable: false })
  medication_name: string;

  @Column({ length: 100, nullable: false })
  dosage: string;

  @Column({ length: 100, nullable: false })
  frequency: string;

  @Column('text', { nullable: false })
  conditions_or_symptoms: string;

  @Column({ type: 'date', nullable: true })
  prescribed_date: Date;

  @Column('text', { nullable: true })
  instructions: string;

  @Column({
    type: 'enum',
    enum: ['taking', 'discontinued'],
    default: 'taking',
    nullable: false
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
}