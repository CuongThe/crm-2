import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from './service.entity';

@Entity('staff_services')
export class StaffService {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: string;

  @PrimaryColumn({ name: 'service_id', type: 'bigint', unsigned: true })
  serviceId: string;

  @ManyToOne(() => User, (user) => user.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Service, (service) => service.staffs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
