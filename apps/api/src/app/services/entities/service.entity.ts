import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StaffService } from './staff-service.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  price: number;

  @Column({
    name: 'duration_minutes',
    type: 'int',
    unsigned: true,
    default: 30,
  })
  durationMinutes: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => StaffService, (staffService) => staffService.service)
  staffs: StaffService[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
