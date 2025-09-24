import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/users.model';
import { Provider } from '../providers/providers.model';
import { Medication } from '../medications/medications.model';
import { VisitSummary } from '../visit_summaries/visit-summaries.model';
import { VisitPrep } from '../visit_prep/visit-prep.model';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  @Index('idx_user_date', { synchronize: false })
  user_id: number;

  @Column()
  @Index()
  provider_id: number;

  @Column({ type: 'date' })
  @Index()
  @Index('idx_user_date', { synchronize: false })
  visit_date: Date;

  @Column({ type: 'time' })
  visit_time: string;

  @Column('text')
  visit_reason: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  })
  @Index()
  status: 'scheduled' | 'completed' | 'cancelled';

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  @Index('idx_user_date', { synchronize: false })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User, user => user.visits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Provider, provider => provider.visits, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @OneToMany(() => Medication, medication => medication.prescribed_during_visit)
  medications: Medication[];

  @OneToOne(() => VisitSummary, summary => summary.visit)
  summary: VisitSummary;

  @OneToOne(() => VisitPrep, prep => prep.visit)
  prep: VisitPrep;
}