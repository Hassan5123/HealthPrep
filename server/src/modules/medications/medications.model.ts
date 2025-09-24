import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/users.model';
import { Provider } from '../providers/providers.model';
import { Visit } from '../visits/visits.model';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  @Index('idx_user_status', { synchronize: false })
  user_id: number;

  @Column({ nullable: true })
  @Index()
  prescribing_provider_id: number;

  @Column({ nullable: true })
  @Index()
  prescribed_during_visit_id: number;

  @Column({ length: 200 })
  @Index()
  medication_name: string;

  @Column({ length: 100 })
  dosage: string;

  @Column({ length: 100 })
  frequency: string;

  @Column('text')
  conditions_or_symptoms: string;

  @Column({ type: 'date', nullable: true })
  @Index()
  prescribed_date: Date;

  @Column('text', { nullable: true })
  instructions: string;

  @Column({
    type: 'enum',
    enum: ['taking', 'discontinued'],
    default: 'taking'
  })
  @Index()
  @Index('idx_user_status', { synchronize: false })
  status: 'taking' | 'discontinued';

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  @Index('idx_user_status', { synchronize: false })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.medications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Provider, provider => provider.medications, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'prescribing_provider_id' })
  prescribing_provider: Provider;

  @ManyToOne(() => Visit, visit => visit.medications, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'prescribed_during_visit_id' })
  prescribed_during_visit: Visit;
}