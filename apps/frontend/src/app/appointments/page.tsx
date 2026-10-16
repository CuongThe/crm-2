'use client';

import AppointmentTable from './appointment-table';

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

        <AppointmentTable />
      </div>
    </main>
  );
}
