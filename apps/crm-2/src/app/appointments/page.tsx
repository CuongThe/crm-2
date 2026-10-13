import { Suspense } from 'react';
import {
  fetchAppointments,
  fetchCustomers,
  fetchServices,
  fetchStaff,
} from '@crm-2/data-access';
import AppointmentTable from './appointment-table';

async function AppointmentsContent() {
  const [appointments, customersRes, services, staffList] = await Promise.all([
    fetchAppointments().catch(() => []),
    fetchCustomers(1, 100).catch(() => ({ data: [] })),
    fetchServices().catch(() => []),
    fetchStaff().catch(() => []),
  ]);

  return (
    <AppointmentTable
      appointments={appointments}
      customers={customersRes.data || []}
      services={services || []}
      staffList={staffList || []}
    />
  );
}

export default function AppointmentsPage() {
  return (
    <main className="min-h-screen bg-slate-50/70 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản lý Lịch hẹn
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, điều phối lịch hẹn phục vụ và cập nhật trạng thái đơn dịch vụ.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400">
              <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p className="text-sm font-medium">Đang tải lịch hẹn và dữ liệu...</p>
            </div>
          }
        >
          <AppointmentsContent />
        </Suspense>
      </div>
    </main>
  );
}
