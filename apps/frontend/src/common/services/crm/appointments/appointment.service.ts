import { CrmBaseService } from '../crm-base.service';
import {
  AppointmentItem,
  AppointmentFilterParams,
  CreateAppointmentInput,
  AppointmentStatusType,
  ServiceItem,
  StaffItem,
} from './types';
import { ApiSuccessResponse, RequestOptions } from '@frontend/common';

export class AppointmentService extends CrmBaseService<AppointmentItem> {
  protected override basePath = '/appointments';

  public getAppointments(
    params?: AppointmentFilterParams,
    options?: RequestOptions,
  ): Promise<AppointmentItem[]> {
    return this.client.get<AppointmentItem[]>(this.basePath, {
      ...options,
      params,
    });
  }

  public getAppointmentById(
    id: string,
    options?: RequestOptions,
  ): Promise<AppointmentItem> {
    return this.client.get<AppointmentItem>(`${this.basePath}/${id}`, options);
  }

  public createAppointment(
    data: CreateAppointmentInput,
    options?: RequestOptions,
  ): Promise<AppointmentItem> {
    return this.client.post<AppointmentItem>(this.basePath, data, options);
  }

  public changeStatus(
    id: string,
    status: AppointmentStatusType,
    options?: RequestOptions,
  ): Promise<AppointmentItem> {
    return this.client.patch<AppointmentItem>(
      `${this.basePath}/${id}/status`,
      { status },
      options,
    );
  }

  public deleteAppointment(
    id: string,
    options?: RequestOptions,
  ): Promise<ApiSuccessResponse> {
    return this.destroy(id, options);
  }

  public getServices(options?: RequestOptions): Promise<ServiceItem[]> {
    return this.client.get<ServiceItem[]>(
      `${this.basePath}/meta/services`,
      options,
    );
  }

  public getStaff(options?: RequestOptions): Promise<StaffItem[]> {
    return this.client.get<StaffItem[]>(
      `${this.basePath}/meta/staff`,
      options,
    );
  }
}

export const appointmentService = new AppointmentService();
