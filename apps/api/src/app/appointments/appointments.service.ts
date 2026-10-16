import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentLog } from './entities/appointment-log.entity';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { AppointmentStatus } from '../common/enums';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const customerId = dto.customerId;
    const staffId = dto.staffId;
    const serviceId = dto.serviceId;

    // 1. Kiểm tra tồn tại của khách, nhân viên, dịch vụ
    const [customer, staff, service] = await Promise.all([
      this.customerRepository.findOne({ where: { id: customerId } }),
      this.userRepository.findOne({ where: { id: staffId } }),
      this.serviceRepository.findOne({ where: { id: serviceId } }),
    ]);

    if (!customer) {
      throw new NotFoundException('Khách hàng không tồn tại');
    }
    if (!staff || !staff.isActive) {
      throw new BadRequestException(
        'Nhân viên không tồn tại hoặc đã ngừng hoạt động',
      );
    }
    if (!service || !service.isActive) {
      throw new BadRequestException(
        'Dịch vụ không tồn tại hoặc tạm ngưng phục vụ',
      );
    }

    // 2. Tính toán endTime tự động dựa trên durationMinutes của dịch vụ
    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu không hợp lệ');
    }

    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60 * 1000,
    );

    // 3. Logic chống trùng lịch (Double Booking Check)
    const conflictingAppointment = await this.appointmentRepository
      .createQueryBuilder('appt')
      .where('appt.staffId = :staffId', { staffId })
      .andWhere('appt.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [
          AppointmentStatus.CANCELED,
          AppointmentStatus.NO_SHOW,
        ],
      })
      .andWhere('appt.startTime < :endTime AND appt.endTime > :startTime', {
        startTime,
        endTime,
      })
      .getOne();

    if (conflictingAppointment) {
      throw new ConflictException(
        'Nhân viên đã có lịch hẹn khác trong khung giờ này. Vui lòng chọn giờ khác.',
      );
    }

    // 4. Lưu lịch hẹn và tạo log trong Transaction
    return this.dataSource.transaction(async (manager) => {
      const appt = manager.create(Appointment, {
        customerId,
        staffId,
        serviceId,
        startTime,
        endTime,
        price: service.price,
        notes: dto.notes,
        status: AppointmentStatus.PENDING,
      });

      const savedAppt = await manager.save(Appointment, appt);

      const log = manager.create(AppointmentLog, {
        appointmentId: savedAppt.id,
        action: 'CREATED',
        note: 'Khởi tạo lịch hẹn mới',
        createdBy: staffId,
      });
      await manager.save(AppointmentLog, log);

      return manager.findOne(Appointment, {
        where: { id: savedAppt.id },
        relations: {
          customer: true,
          staff: true,
          service: true,
        },
      });
    });
  }

  async findAll(query: QueryAppointmentDto) {
    const qb = this.appointmentRepository
      .createQueryBuilder('appt')
      .leftJoinAndSelect('appt.customer', 'customer')
      .leftJoinAndSelect('appt.staff', 'staff')
      .leftJoinAndSelect('appt.service', 'service')
      .orderBy('appt.startTime', 'ASC');

    if (query.staffId) {
      qb.andWhere('appt.staffId = :staffId', { staffId: query.staffId });
    }

    if (query.status) {
      qb.andWhere('appt.status = :status', { status: query.status });
    }

    if (query.fromDate) {
      qb.andWhere('appt.startTime >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }

    if (query.toDate) {
      qb.andWhere('appt.startTime <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        staff: true,
        service: true,
        logs: true,
      },
      order: {
        logs: {
          createdAt: 'DESC',
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn #${id}`);
    }

    return appointment;
  }

  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
    currentUserId?: string,
  ) {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Lịch hẹn đã hoàn thành trước đó, không thể chỉnh sửa',
      );
    }

    if (appointment.status === AppointmentStatus.CANCELED) {
      throw new BadRequestException(
        'Lịch hẹn đã bị hủy, không thể thay đổi trạng thái',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      appointment.status = dto.status;
      const updated = await manager.save(Appointment, appointment);

      const log = manager.create(AppointmentLog, {
        appointmentId: id,
        action: `STATUS_CHANGED_TO_${dto.status}`,
        note: dto.note || `Chuyển trạng thái sang ${dto.status}`,
        createdBy: currentUserId || null,
      });
      await manager.save(AppointmentLog, log);

      if (dto.status === AppointmentStatus.COMPLETED) {
        await manager.increment(
          Customer,
          { id: appointment.customerId },
          'visitCount',
          1,
        );
        await manager
          .createQueryBuilder()
          .update(Customer)
          .set({
            totalSpent: () => `total_spent + ${Number(appointment.price)}`,
          })
          .where('id = :id', { id: appointment.customerId })
          .execute();
      }

      return updated;
    });
  }

  async getServices() {
    return this.serviceRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getStaff() {
    return this.userRepository.find({
      where: { isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
      },
      order: { fullName: 'ASC' },
    });
  }

  async remove(id: string) {
    const appointment = await this.findOne(id);
    return this.appointmentRepository.remove(appointment);
  }
}
