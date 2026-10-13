import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AppointmentStatus } from '../../common/enums';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { AppointmentLog } from './appointment-log.entity';

@Entity('appointments')
@Index('idx_staff_schedule', ['staffId', 'startTime', 'endTime'])
@Index('idx_status_start_time', ['status', 'startTime'])
@Index('idx_customer_appointments', ['customerId', 'startTime'])
export class Appointment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'customer_id', type: 'bigint', unsigned: true })
  customerId: string;

  @Column({ name: 'staff_id', type: 'bigint', unsigned: true })
  staffId: string;

  @Column({ name: 'service_id', type: 'bigint', unsigned: true })
  serviceId: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
  })
  price: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.appointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @ManyToOne(() => Service, (service) => service.appointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @OneToMany(() => AppointmentLog, (log) => log.appointment)
  logs: AppointmentLog[];
}
