import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../database/data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RevenueModule } from './revenue/revenue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    CustomersModule,
    AppointmentsModule,
    UsersModule,
    ServicesModule,
    DashboardModule,
    RevenueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
