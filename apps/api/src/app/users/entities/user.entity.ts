import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../common/enums';
import { StaffService } from '../../services/entities/staff-service.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { AppointmentLog } from '../../appointments/entities/appointment-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.STAFF })
  role!: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => StaffService, (staffService) => staffService.user)
  services!: StaffService[];

  @OneToMany(() => Appointment, (appointment) => appointment.staff)
  appointments!: Appointment[];

  @OneToMany(() => AppointmentLog, (log) => log.creator)
  appointmentLogs!: AppointmentLog[];
}
