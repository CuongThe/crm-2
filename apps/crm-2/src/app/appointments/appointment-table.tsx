'use client';

import { useState, useMemo } from 'react';
import { AppointmentItem, Customer, ServiceItem, StaffItem, AppointmentStatusType } from '@crm-2/shared-types';
import StatusSelector from './status-selector';
import AppointmentCreateModal from './appointment-create-modal';
import AppointmentDeleteModal from './appointment-delete-modal';
import { useRouter } from 'next/navigation';

interface AppointmentTableProps {
  appointments: AppointmentItem[];
  customers: Customer[];
  services: ServiceItem[];
  staffList: StaffItem[];
}

export default function AppointmentTable({
  appointments,
  customers,
  services,
  staffList,
}: AppointmentTableProps) {
  const router = useRouter();

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    customerName: string;
    serviceName: string;
  } | null>(null);

  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'ALL') return appointments;
    return appointments.filter((a) => a.status === filterStatus);
  }, [appointments, filterStatus]);

  const statusFilterTabs = [
    { label: 'Tất cả', value: 'ALL', count: appointments.length },
    { label: 'Chờ xử lý', value: 'PENDING', count: appointments.filter((a) => a.status === 'PENDING').length },
    { label: 'Đã xác nhận', value: 'CONFIRMED', count: appointments.filter((a) => a.status === 'CONFIRMED').length },
    { label: 'Hoàn thành', value: 'COMPLETED', count: appointments.filter((a) => a.status === 'COMPLETED').length },
    { label: 'Đã hủy', value: 'CANCELED', count: appointments.filter((a) => a.status === 'CANCELED').length },
    { label: 'Không đến', value: 'NO_SHOW', count: appointments.filter((a) => a.status === 'NO_SHOW').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          {statusFilterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === tab.value
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.value
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Create appointment button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Đặt lịch hẹn mới
        </button>
      </div>

      {/* Appointments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Thời gian</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Dịch vụ</th>
                <th className="py-3.5 px-4">Nhân viên</th>
                <th className="py-3.5 px-4 text-right">Chi phí</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-medium text-slate-600">Không có lịch hẹn nào</p>
                      <p className="text-xs text-slate-400">
                        {filterStatus !== 'ALL'
                          ? `Không có cuộc hẹn nào ở trạng thái ${filterStatus}.`
                          : 'Nhấn "Đặt lịch hẹn mới" để lên lịch phục vụ khách hàng.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] uppercase font-bold leading-tight">
                            {new Date(app.startTime).toLocaleDateString('vi-VN', { month: 'numeric' })}
                          </span>
                          <span className="text-xs font-black leading-tight">
                            {new Date(app.startTime).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {new Date(app.startTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(app.endTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(app.startTime).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.customer?.fullName}</p>
                      <p className="text-xs text-slate-400">{app.customer?.phone}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{app.service?.name}</p>
                      <p className="text-xs text-slate-400">{app.service?.durationMinutes} phút</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        {app.staff?.fullName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {Number(app.price).toLocaleString('vi-VN')} đ
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <StatusSelector id={app.id} currentStatus={app.status as AppointmentStatusType} />
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: app.id,
                            customerName: app.customer?.fullName || 'Khách hàng',
                            serviceName: app.service?.name || 'Dịch vụ',
                          })
                        }
                        title="Xóa lịch hẹn"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AppointmentCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        customers={customers}
        services={services}
        staffList={staffList}
        onSuccess={() => router.refresh()}
      />

      <AppointmentDeleteModal
        appointmentId={deleteTarget?.id || null}
        customerName={deleteTarget?.customerName}
        serviceName={deleteTarget?.serviceName}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
