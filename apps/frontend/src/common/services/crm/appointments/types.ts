export type AppointmentStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

export interface ServiceItem {
  id: string;
  name: string;
  price: string | number;
  durationMinutes: number;
  description?: string | null;
}

export interface StaffItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AppointmentItem {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatusType;
  price: string | number;
  notes?: string | null;
  customer: { id: string; fullName: string; phone: string };
  staff: { id: string; fullName: string };
  service: { id: string; name: string; durationMinutes: number };
}

export interface CreateAppointmentInput {
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
}

export interface AppointmentFilterParams {
  status?: string;
  staffId?: string;
  fromDate?: string;
  toDate?: string;
}
