import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Service } from '../services/entities/service.entity';
import { AppointmentStatus } from '../common/enums';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getStats(query: DashboardQueryDto) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const fromDate = query.fromDate ? new Date(query.fromDate) : startOfMonth;
    const toDate = query.toDate ? new Date(query.toDate) : endOfMonth;

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const [
      revenueAggregate,
      todayAppointmentsCount,
      newCustomersCount,
      statusDistribution,
      serviceRanking,
    ] = await Promise.all([
      // 1. Tổng doanh thu COMPLETED trong kỳ
      this.appointmentRepository
        .createQueryBuilder('appt')
        .select('SUM(appt.price)', 'totalRevenue')
        .where('appt.status = :status', { status: AppointmentStatus.COMPLETED })
        .andWhere('appt.startTime >= :fromDate AND appt.startTime <= :toDate', {
          fromDate,
          toDate,
        })
        .getRawOne(),

      // 2. Số lượng lịch hẹn trong ngày hôm nay
      this.appointmentRepository
        .createQueryBuilder('appt')
        .where('appt.startTime >= :startOfToday AND appt.startTime <= :endOfToday', {
          startOfToday,
          endOfToday,
        })
        .getCount(),

      // 3. Khách hàng mới đăng ký trong kỳ
      this.customerRepository
        .createQueryBuilder('c')
        .where('c.createdAt >= :fromDate AND c.createdAt <= :toDate', {
          fromDate,
          toDate,
        })
        .getCount(),

      // 4. Phân bổ theo trạng thái
      this.appointmentRepository
        .createQueryBuilder('appt')
        .select('appt.status', 'status')
        .addSelect('COUNT(appt.id)', 'count')
        .where('appt.startTime >= :fromDate AND appt.startTime <= :toDate', {
          fromDate,
          toDate,
        })
        .groupBy('appt.status')
        .getRawMany(),

      // 5. Top dịch vụ được đặt
      this.appointmentRepository
        .createQueryBuilder('appt')
        .select('appt.serviceId', 'serviceId')
        .addSelect('COUNT(appt.id)', 'count')
        .addSelect('SUM(appt.price)', 'totalRevenue')
        .where('appt.startTime >= :fromDate AND appt.startTime <= :toDate', {
          fromDate,
          toDate,
        })
        .andWhere('appt.status != :canceled', {
          canceled: AppointmentStatus.CANCELED,
        })
        .groupBy('appt.serviceId')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany(),
    ]);

    // Map tên dịch vụ
    const serviceIds = serviceRanking.map((item) => item.serviceId);
    let serviceNameMap = new Map<string, string>();
    if (serviceIds.length > 0) {
      const services = await this.serviceRepository
        .createQueryBuilder('s')
        .where('s.id IN (:...serviceIds)', { serviceIds })
        .getMany();
      serviceNameMap = new Map(services.map((s) => [s.id.toString(), s.name]));
    }

    return {
      range: {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      },
      kpi: {
        totalRevenue: Number(revenueAggregate?.totalRevenue || 0),
        todayAppointments: todayAppointmentsCount,
        newCustomers: newCustomersCount,
      },
      statusDistribution: statusDistribution.map((item) => ({
        status: item.status,
        count: Number(item.count),
      })),
      topServices: serviceRanking.map((item) => ({
        serviceId: item.serviceId?.toString(),
        serviceName:
          serviceNameMap.get(item.serviceId?.toString()) || 'Unknown',
        bookingCount: Number(item.count),
        totalRevenue: Number(item.totalRevenue || 0),
      })),
    };
  }
}
