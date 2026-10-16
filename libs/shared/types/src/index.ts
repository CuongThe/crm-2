export interface DashboardStats {
  range: { fromDate: string; toDate: string };
  kpi: {
    totalRevenue: string | number;
    todayAppointments: number;
    newCustomers: number;
  };
  statusDistribution: { status: string; count: number }[];
  topServices: {
    serviceId: string;
    serviceName: string;
    bookingCount: number;
    totalRevenue: string | number;
  }[];
}

export type AppointmentStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

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

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string | null;
  notes?: string | null;
  totalSpent: string | number;
  visitCount: number;
  createdAt: string;
  updatedAt?: string;
  appointments?: AppointmentItem[];
}

export interface CustomerListResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: Customer[];
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  isActive: boolean;
}

export interface StaffItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface DailyRevenueItem {
  day: number;
  date: string;
  revenue: number;
  count: number;
}

export interface ServiceRevenueItem {
  serviceId: string;
  serviceName: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface RevenueAppointmentItem {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  notes?: string | null;
  customer: { id: string; fullName: string; phone: string } | null;
  staff: { id: string; fullName: string } | null;
  service: { id: string; name: string; durationMinutes: number } | null;
}

export interface RevenueReportResponse {
  month: string;
  range: { fromDate: string; toDate: string };
  summary: {
    totalRevenue: number;
    totalCount: number;
    averageOrderValue: number;
  };
  dailyStats: DailyRevenueItem[];
  serviceStats: ServiceRevenueItem[];
  appointments: RevenueAppointmentItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STAFF';
  phone?: string | null;
  isActive?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

