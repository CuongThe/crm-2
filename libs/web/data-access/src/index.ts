import { cookies } from 'next/headers';
import {
  DashboardStats,
  AppointmentItem,
  Customer,
  CustomerListResponse,
  ServiceItem,
  StaffItem,
  RevenueReportResponse,
} from '@crm-2/shared-types';

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api';

interface ApiErrorResponse {
  message?: string;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Không có trong request context (hoặc đang chạy ngoài request)
  }
  return {};
}

// Dashboard
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboard/stats`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải dữ liệu dashboard');
  return res.json() as Promise<DashboardStats>;
}

// Appointments
export async function fetchAppointments(params?: {
  status?: string;
  staffId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<AppointmentItem[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.staffId) query.append('staffId', params.staffId);
  if (params?.fromDate) query.append('fromDate', params.fromDate);
  if (params?.toDate) query.append('toDate', params.toDate);

  const authHeaders = await getAuthHeaders();
  const url = `${API_URL}/appointments${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải danh sách lịch hẹn');
  return res.json() as Promise<AppointmentItem[]>;
}

export async function fetchAppointmentById(id: string): Promise<AppointmentItem> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Không thể tải thông tin lịch hẹn #${id}`);
  return res.json() as Promise<AppointmentItem>;
}

export async function createAppointment(data: {
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
}): Promise<AppointmentItem> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(err.message || 'Lỗi khi tạo lịch hẹn');
  }
  return res.json() as Promise<AppointmentItem>;
}

export async function updateAppointmentStatus(
  id: string,
  status: string,
  note?: string,
): Promise<AppointmentItem> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(err.message || 'Lỗi khi cập nhật trạng thái');
  }
  return res.json() as Promise<AppointmentItem>;
}

export async function deleteAppointment(id: string): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(err.message || 'Lỗi khi xóa lịch hẹn');
  }
}

// Meta for appointment booking
export async function fetchServices(): Promise<ServiceItem[]> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/appointments/meta/services`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải danh sách dịch vụ');
  return res.json() as Promise<ServiceItem[]>;
}

export async function fetchStaff(): Promise<StaffItem[]> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/appointments/meta/staff`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải danh sách nhân viên');
  return res.json() as Promise<StaffItem[]>;
}

// Customers
export async function fetchCustomers(
  page = 1,
  limit = 10,
  search?: string,
): Promise<CustomerListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) query.append('search', search);

  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/customers?${query.toString()}`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải danh sách khách hàng');
  return res.json() as Promise<CustomerListResponse>;
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/customers/${id}`, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Không thể tìm thấy khách hàng #${id}`);
  return res.json() as Promise<Customer>;
}

export async function createCustomer(data: {
  fullName: string;
  phone: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  notes?: string;
}): Promise<Customer> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(err.message || 'Lỗi khi tạo mới khách hàng');
  }
  return res.json() as Promise<Customer>;
}

export async function updateCustomer(
  id: string,
  data: Partial<{
    fullName: string;
    phone: string;
    email?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dob?: string;
    notes?: string;
  }>,
): Promise<Customer> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(err.message || 'Lỗi khi cập nhật thông tin khách hàng');
  }
  return res.json() as Promise<Customer>;
}

export async function deleteCustomer(id: string): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(err.message || 'Lỗi khi xóa khách hàng');
  }
}

// Revenue
export async function fetchRevenueReport(
  month?: string,
  serviceId?: string,
): Promise<RevenueReportResponse> {
  const query = new URLSearchParams();
  if (month) query.append('month', month);
  if (serviceId) query.append('serviceId', serviceId);

  const authHeaders = await getAuthHeaders();
  const url = `${API_URL}/revenue${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { ...authHeaders },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải báo cáo doanh thu');
  return res.json() as Promise<RevenueReportResponse>;
}
