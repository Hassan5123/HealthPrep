import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.model';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ nullable: false })
  provider_id: number;

  @Column({ type: 'date', nullable: false })
  visit_date: Date;

  @Column({ type: 'time', nullable: true })
  visit_time: string;

  @Column('text', { nullable: false })
  visit_reason: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'completed'],
    default: 'scheduled',
    nullable: false,
  })
  status: 'scheduled' | 'completed';

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User, user => user.visits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne('Provider', 'visits', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider: any;

  @OneToMany('Medication', 'prescribed_during_visit')
  medications: any[];

  @OneToOne('VisitSummary', 'visit')
  summary: any;

  @OneToOne('VisitPrep', 'visit')
  prep: any;
}