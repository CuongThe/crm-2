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

export interface RevenueFilterParams {
  month?: string;
  serviceId?: string;
}
