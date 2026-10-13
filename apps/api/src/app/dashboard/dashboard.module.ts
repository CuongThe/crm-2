import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Customer, Service])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
