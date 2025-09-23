import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/users.model';
import { Visit } from '../visits/visits.model';

@Entity('visit_prep')
export class VisitPrep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column({ nullable: true })
  @Index()
  visit_id: number;

  @Column('text')
  questions_for_doctor: string;

  @Column('text', { nullable: true })
  symptoms_to_discuss: string;

  @Column('text', { nullable: true })
  medication_issues: string;

  @Column('text', { nullable: true })
  other_notes: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'completed'],
    default: 'draft'
  })
  @Index()
  status: 'draft' | 'completed';

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User, user => user.visitPreps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Visit, visit => visit.prep, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;
}