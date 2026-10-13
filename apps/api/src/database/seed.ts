import dataSource from './data-source';
import { User } from '../app/users/entities/user.entity';
import { Service } from '../app/services/entities/service.entity';
import { Customer } from '../app/customers/entities/customer.entity';
import { Appointment } from '../app/appointments/entities/appointment.entity';
import { AppointmentLog } from '../app/appointments/entities/appointment-log.entity';
import { Role, Gender, AppointmentStatus } from '../app/common/enums';

async function seed() {
  await dataSource.initialize();
  console.log('🌱 Seeding initial data for CRM-2...');

  const userRepo = dataSource.getRepository(User);
  const serviceRepo = dataSource.getRepository(Service);
  const customerRepo = dataSource.getRepository(Customer);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const logRepo = dataSource.getRepository(AppointmentLog);

  // 1. Staff Users
  const staffData = [
    {
      email: 'mai.nguyen@crm.local',
      passwordHash: 'dummy_hash',
      fullName: 'Nguyễn Thị Mai',
      phone: '0987654321',
      role: Role.STAFF,
      isActive: true,
    },
    {
      email: 'hung.tran@crm.local',
      passwordHash: 'dummy_hash',
      fullName: 'Trần Văn Hùng',
      phone: '0912345678',
      role: Role.STAFF,
      isActive: true,
    },
    {
      email: 'trang.le@crm.local',
      passwordHash: 'dummy_hash',
      fullName: 'Lê Thu Trang',
      phone: '0978123456',
      role: Role.STAFF,
      isActive: true,
    },
  ];

  const staffMembers: User[] = [];
  for (const s of staffData) {
    let user = await userRepo.findOne({ where: { email: s.email } });
    if (!user) {
      user = await userRepo.save(userRepo.create(s));
    }
    staffMembers.push(user);
  }

  // 2. Services
  const servicesData = [
    {
      name: 'Cắt tóc & Tạo kiểu thời trang',
      description: 'Tư vấn dáng tóc, cắt và sấy tạo kiểu chuẩn salon',
      price: 150000,
      durationMinutes: 45,
    },
    {
      name: 'Chăm sóc da mặt chuyên sâu',
      description: 'Làm sạch sâu, hút bã nhờn, điện di tinh chất collagen',
      price: 350000,
      durationMinutes: 60,
    },
    {
      name: 'Gội đầu dưỡng sinh thảo dược',
      description: 'Massage bấm huyệt cổ vai gáy và gội đầu thảo dược tự nhiên',
      price: 120000,
      durationMinutes: 45,
    },
    {
      name: 'Massage trị liệu vai gáy',
      description: 'Trị liệu căng cơ, giải tỏa đau mỏi vai gáy',
      price: 280000,
      durationMinutes: 60,
    },
    {
      name: 'Phục hồi tóc Keratin cao cấp',
      description: 'Phục hồi tóc khô xơ chẻ ngọn bóng mượt',
      price: 450000,
      durationMinutes: 90,
    },
  ];

  const services: Service[] = [];
  for (const s of servicesData) {
    let service = await serviceRepo.findOne({ where: { name: s.name } });
    if (!service) {
      service = await serviceRepo.save(
        serviceRepo.create({ ...s, isActive: true }),
      );
    }
    services.push(service);
  }

  // 3. Customers
  const customersData = [
    {
      fullName: 'Phạm Thu Hà',
      phone: '0901234567',
      email: 'ha.pham@gmail.com',
      gender: Gender.FEMALE,
      notes: 'Khách hàng thích dịch vụ chăm sóc da nhẹ nhàng',
    },
    {
      fullName: 'Hoàng Minh Đức',
      phone: '0934567890',
      email: 'duc.hoang@gmail.com',
      gender: Gender.MALE,
      notes: 'Khách quen, hay cắt tóc cuối tuần',
    },
    {
      fullName: 'Đặng Ngọc Ánh',
      phone: '0988889999',
      email: 'anh.dang@gmail.com',
      gender: Gender.FEMALE,
      notes: 'Quan tâm dịch vụ gội đầu dưỡng sinh',
    },
  ];

  const customers: Customer[] = [];
  for (const c of customersData) {
    let customer = await customerRepo.findOne({ where: { phone: c.phone } });
    if (!customer) {
      customer = await customerRepo.save(customerRepo.create(c));
    }
    customers.push(customer);
  }

  // 4. Sample Appointments
  const appointmentCount = await appointmentRepo.count();
  if (appointmentCount === 0 && services.length > 0) {
    const sampleAppointments = [
      {
        customerId: customers[0].id,
        staffId: staffMembers[0].id,
        serviceId: services[0].id,
        startTime: new Date('2026-10-02T09:00:00'),
        endTime: new Date('2026-10-02T09:45:00'),
        price: services[0].price,
        status: AppointmentStatus.COMPLETED,
        notes: 'Khách thanh toán tiền mặt',
      },
      {
        customerId: customers[1].id,
        staffId: staffMembers[1].id,
        serviceId: services[1].id,
        startTime: new Date('2026-10-05T14:00:00'),
        endTime: new Date('2026-10-05T15:00:00'),
        price: services[1].price,
        status: AppointmentStatus.COMPLETED,
        notes: 'Chuyển khoản VietQR',
      },
      {
        customerId: customers[2].id,
        staffId: staffMembers[2].id,
        serviceId: services[2].id,
        startTime: new Date('2026-10-08T10:30:00'),
        endTime: new Date('2026-10-08T11:15:00'),
        price: services[2].price,
        status: AppointmentStatus.COMPLETED,
        notes: 'Khách hài lòng, đặt lịch tuần tới',
      },
      {
        customerId: customers[0].id,
        staffId: staffMembers[1].id,
        serviceId: services[3].id,
        startTime: new Date('2026-10-10T16:00:00'),
        endTime: new Date('2026-10-10T17:00:00'),
        price: services[3].price,
        status: AppointmentStatus.CONFIRMED,
        notes: 'Đã gọi điện xác nhận',
      },
      {
        customerId: customers[1].id,
        staffId: staffMembers[0].id,
        serviceId: services[4].id,
        startTime: new Date('2026-10-13T11:00:00'),
        endTime: new Date('2026-10-13T12:30:00'),
        price: services[4].price,
        status: AppointmentStatus.PENDING,
        notes: 'Đặt online qua web',
      },
    ];

    for (const app of sampleAppointments) {
      const saved = await appointmentRepo.save(appointmentRepo.create(app));
      await logRepo.save(
        logRepo.create({
          appointmentId: saved.id,
          action: 'CREATED',
          note: 'Tạo lịch hẹn mẫu',
          createdBy: app.staffId,
        }),
      );
    }
    console.log(`✅ Đã tạo thành công ${sampleAppointments.length} lịch hẹn mẫu!`);
  }

  console.log('✨ Seed hoàn tất thành công!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
