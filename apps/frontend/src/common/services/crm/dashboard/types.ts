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
