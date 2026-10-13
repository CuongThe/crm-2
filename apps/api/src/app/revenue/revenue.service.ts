import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../common/enums';
import { RevenueQueryDto } from './dto/revenue-query.dto';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async getRevenueReport(query: RevenueQueryDto) {
    const now = new Date();
    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    if (query.month) {
      const parts = query.month.split('-');
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        year = y;
        monthIndex = m - 1;
      }
    }

    const fromDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const toDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const qb = this.appointmentRepository
      .createQueryBuilder('appt')
      .leftJoinAndSelect('appt.customer', 'customer')
      .leftJoinAndSelect('appt.staff', 'staff')
      .leftJoinAndSelect('appt.service', 'service')
      .where('appt.status = :status', { status: AppointmentStatus.COMPLETED })
      .andWhere('appt.startTime >= :fromDate AND appt.startTime <= :toDate', {
        fromDate,
        toDate,
      })
      .orderBy('appt.startTime', 'DESC');

    if (query.serviceId) {
      qb.andWhere('appt.serviceId = :serviceId', {
        serviceId: query.serviceId,
      });
    }

    const appointments = await qb.getMany();

    let totalRevenue = 0;
    const totalCount = appointments.length;

    // Khởi tạo mảng thống kê từng ngày trong tháng
    const dailyStats = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        day,
        date: dateStr,
        revenue: 0,
        count: 0,
      };
    });

    const serviceMap = new Map<
      string,
      {
        serviceId: string;
        serviceName: string;
        revenue: number;
        count: number;
      }
    >();

    for (const app of appointments) {
      const appPrice = Number(app.price);
      totalRevenue += appPrice;

      // Tính theo ngày
      const appDate = new Date(app.startTime);
      const day = appDate.getDate();
      if (day >= 1 && day <= daysInMonth) {
        dailyStats[day - 1].revenue += appPrice;
        dailyStats[day - 1].count += 1;
      }

      // Tính theo dịch vụ
      const sId = app.serviceId.toString();
      const sName = app.service?.name || 'Dịch vụ khác';
      const existing = serviceMap.get(sId) || {
        serviceId: sId,
        serviceName: sName,
        revenue: 0,
        count: 0,
      };
      existing.revenue += appPrice;
      existing.count += 1;
      serviceMap.set(sId, existing);
    }

    const serviceStats = Array.from(serviceMap.values())
      .map((s) => ({
        ...s,
        percentage:
          totalRevenue > 0
            ? Math.round((s.revenue / totalRevenue) * 100)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const averageOrderValue =
      totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    return {
      month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      range: {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      },
      summary: {
        totalRevenue,
        totalCount,
        averageOrderValue,
      },
      dailyStats,
      serviceStats,
      appointments: appointments.map((app) => ({
        id: app.id.toString(),
        startTime: app.startTime.toISOString(),
        endTime: app.endTime.toISOString(),
        price: Number(app.price),
        notes: app.notes,
        customer: app.customer
          ? {
              id: app.customer.id.toString(),
              fullName: app.customer.fullName,
              phone: app.customer.phone,
            }
          : null,
        staff: app.staff
          ? {
              id: app.staff.id.toString(),
              fullName: app.staff.fullName,
            }
          : null,
        service: app.service
          ? {
              id: app.service.id.toString(),
              name: app.service.name,
              durationMinutes: app.service.durationMinutes,
            }
          : null,
      })),
    };
  }
}
