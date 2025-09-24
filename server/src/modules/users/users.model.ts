import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true, nullable: false })
  email: string;

  @Column({ length: 255, nullable: false })
  password_hash: string;

  @Column({ length: 100, nullable: false })
  first_name: string;

  @Column({ length: 100, nullable: false })
  last_name: string;

  @Column({ type: 'date', nullable: false })
  date_of_birth: Date;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  existing_conditions: string;

  @Column({ type: 'timestamp', nullable: true })
  soft_deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany('Symptom', 'user')
  symptoms: any[];

  @OneToMany('Visit', 'user')
  visits: any[];

  @OneToMany('Medication', 'user')
  medications: any[];
}