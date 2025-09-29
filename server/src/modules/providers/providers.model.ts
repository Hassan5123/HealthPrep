import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.model';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user_id: number;

  @Column({ length: 200, nullable: false })
  provider_name: string;

  @Column({
    type: 'enum',
    enum: ['personal_doctor', 'walk_in_clinic', 'emergency_room'],
    default: 'personal_doctor',
    nullable: false
  })
  provider_type: 'personal_doctor' | 'walk_in_clinic' | 'emergency_room';

  @Column({ length: 100, nullable: true })
  specialty: string;

  @Column({ length: 20, nullable: false })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  office_address: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User, user => user.providers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany('Visit', 'provider')
  visits: any[];

  @OneToMany('Medication', 'prescribing_provider')
  medications: any[];
}