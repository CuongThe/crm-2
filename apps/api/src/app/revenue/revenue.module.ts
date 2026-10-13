import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [RevenueController],
  providers: [RevenueService],
})
export class RevenueModule {}
