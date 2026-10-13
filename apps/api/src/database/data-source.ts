import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

import { Customer } from '../app/customers/entities/customer.entity';
import { User } from '../app/users/entities/user.entity';
import { Service } from '../app/services/entities/service.entity';
import { StaffService } from '../app/services/entities/staff-service.entity';
import { Appointment } from '../app/appointments/entities/appointment.entity';
import { AppointmentLog } from '../app/appointments/entities/appointment-log.entity';

// Nạp file .env từ thư mục gốc
config({ path: path.resolve(__dirname, '../../../../.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'crm_user',
  password: process.env.DB_PASSWORD || '1',
  database: process.env.DB_DATABASE || 'crm_2',
  entities: [Customer, User, Service, StaffService, Appointment, AppointmentLog],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false, // BẮT BUỘC: Khi dùng migration phải tắt synchronize
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;