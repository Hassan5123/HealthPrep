import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Visit } from '../visits/visits.model';

@Entity('visit_summaries')
export class VisitSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  visit_id: number;

  @Column('text')
  diagnoses: string;

  @Column('text', { nullable: true })
  treatment_plan: string;

  @Column('text', { nullable: true })
  prescriptions_info: string;

  @Column('text', { nullable: true })
  followup_instructions: string;

  @Column('text', { nullable: true })
  doctor_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  soft_deleted_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  last_modified: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @OneToOne(() => Visit, visit => visit.summary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;
}