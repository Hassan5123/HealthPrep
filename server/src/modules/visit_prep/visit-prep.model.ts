import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('visit_prep')
export class VisitPrep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  visit_id: number;

  @Column('text', { nullable: true })
  questions_to_ask: string;

  @Column('text', { nullable: true })
  symptoms_to_discuss: string;

  @Column('text', { nullable: true })
  conditions_to_discuss: string;

  @Column('text', { nullable: true })
  medications_to_discuss: string;

  @Column('text', { nullable: true })
  goals_for_visit: string;

  @Column('text')
  prep_summary_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  last_modified: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @OneToOne('Visit', 'prep', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: any;
}