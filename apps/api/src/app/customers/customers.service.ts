import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.customerRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException(
        'Số điện thoại khách hàng đã tồn tại trên hệ thống',
      );
    }

    const customer = this.customerRepository.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      gender: dto.gender,
      dob: dto.dob ? new Date(dto.dob) : null,
      notes: dto.notes,
    });

    return this.customerRepository.save(customer);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    let where = {};
    if (search) {
      where = [
        { fullName: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
      ];
    }

    const [data, total] = await this.customerRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findOne(id: string) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: {
        appointments: {
          service: true,
          staff: true,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với ID #${id}`);
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    if (dto.phone && dto.phone !== customer.phone) {
      const duplicate = await this.customerRepository.findOne({
        where: { phone: dto.phone, id: Not(id) },
      });
      if (duplicate) {
        throw new ConflictException(
          'Số điện thoại mới đã được sử dụng bởi khách hàng khác',
        );
      }
    }

    const updated = this.customerRepository.merge(customer, {
      ...dto,
      dob: dto.dob ? new Date(dto.dob) : customer.dob,
    });

    return this.customerRepository.save(updated);
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    return this.customerRepository.remove(customer);
  }
}
