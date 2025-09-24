import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('visit_summaries')
export class VisitSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  visit_id: number;

  @Column('text', { nullable: true })
  new_diagnosis: string;

  @Column('text', { nullable: true })
  follow_up_instructions: string;

  @Column('text', { nullable: true })
  doctor_recommendations: string;

  @Column('text', { nullable: true })
  patient_concerns_addressed: string;

  @Column('text', { nullable: true })
  patient_concerns_not_addressed: string;

  @Column('text')
  visit_summary_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToOne('Visit', 'summary', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: any;
}