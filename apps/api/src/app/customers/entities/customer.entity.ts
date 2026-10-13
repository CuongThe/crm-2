import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Gender } from '../../common/enums';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('customers')
@Index('idx_customers_phone', ['phone'])
@Index('idx_customers_name', ['fullName'])
export class Customer {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    name: 'total_spent',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  totalSpent: number;

  @Column({ name: 'visit_count', type: 'int', unsigned: true, default: 0 })
  visitCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointments: Appointment[];
}
