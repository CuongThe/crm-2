'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { AppointmentItem } from '@/common/services/crm/appointments/types';
import { Customer } from '@/common/services/crm/customers/types';
import { ServiceItem, StaffItem } from '@/common/services/crm/appointments/types';
import { appointmentService } from '@/common/services/crm/appointments/appointment.service';
import { customerService } from '@/common/services/crm/customers/customer.service';
import StatusSelector from './status-selector';
import AppointmentCreateDialog from './appointment-create-dialog';
import AppointmentDeleteDialog from './appointment-delete-dialog';

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    customerName: string;
    serviceName: string;
  } | null>(null);

  // Lấy dữ liệu ở trang admin: Gọi service trong useEffect (KHÔNG dùng useQuery)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, custRes, srvRes, stfRes] = await Promise.all([
        appointmentService.getAppointments(),
        customerService.getCustomers({ page: 1, limit: 100 }),
        appointmentService.getServices(),
        appointmentService.getStaff(),
      ]);

      setAppointments(appRes || []);
      setCustomers(custRes.data || []);
      setServices(srvRes || []);
      setStaffList(stfRes || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.value
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Đặt lịch hẹn mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Appointments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Khách hàng</th>
                <th className="py-3.5 px-4">Dịch vụ</th>
                <th className="py-3.5 px-4">Kỹ thuật viên</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Chi phí</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span className="text-xs font-medium">Đang tải lịch hẹn...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-slate-600">Không có lịch hẹn nào</p>
                      <p className="text-xs">Chưa có lịch hẹn nào ở trạng thái này.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-slate-900 leading-tight">
                        {app.customer?.fullName || 'Khách vãng lai'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {app.customer?.phone || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{app.service?.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {app.service?.durationMinutes} phút
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {app.staff?.fullName || 'Chưa gán'}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-slate-800">
                        {new Date(app.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(app.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {new Date(app.startTime).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusSelector
                        id={app.id}
                        currentStatus={app.status}
                        onStatusChanged={() => fetchAllData()}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-indigo-600 text-xs">
                      {Number(app.price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: app.id,
                            customerName: app.customer?.fullName || '',
                            serviceName: app.service?.name || '',
                          })
                        }
                        title="Hủy lịch hẹn"
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

      {/* Dialogs dạng hàm gọi service trực tiếp */}
      <AppointmentCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        customers={customers}
        services={services}
        staffList={staffList}
        onSuccess={() => fetchAllData()}
      />

      <AppointmentDeleteDialog
        appointmentId={deleteTarget?.id || null}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => fetchAllData()}
      />
    </div>
  );
}
