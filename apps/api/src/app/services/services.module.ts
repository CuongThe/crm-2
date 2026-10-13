import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { StaffService } from './entities/staff-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, StaffService])],
  exports: [TypeOrmModule],
})
export class ServicesModule {}
