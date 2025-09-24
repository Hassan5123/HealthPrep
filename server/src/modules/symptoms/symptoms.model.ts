import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Check } from 'typeorm';
import { User } from '../users/users.model';

@Entity('symptoms_or_side_effects')
@Check(`severity >= 1 AND severity <= 10`)
export class Symptom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  @Index('idx_user_status', { synchronize: false })
  user_id: number;

  @Column({ length: 200 })
  @Index()
  symptom_name: string;

  @Column()
  severity: number;

  @Column({ type: 'date' })
  @Index()
  onset_date: Date;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ length: 200, nullable: true })
  location_on_body: string;

  @Column('text', { nullable: true })
  triggers: string;

  @Column('text', { nullable: true })
  related_condition: string;

  @Column('text', { nullable: true })
  related_medications: string;

  @Column('text', { nullable: true })
  medications_taken: string;

  @Column({
    type: 'enum',
    enum: ['active', 'resolved', 'monitoring'],
    default: 'active'
  })
  @Index()
  @Index('idx_user_status', { synchronize: false })
  status: 'active' | 'resolved' | 'monitoring';

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  @Index('idx_user_status', { synchronize: false })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User, user => user.symptoms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}