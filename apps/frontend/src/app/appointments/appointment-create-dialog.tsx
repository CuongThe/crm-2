'use client';

import { useState, useMemo } from 'react';
import { Customer } from '@/common/services/crm/customers/types';
import { ServiceItem, StaffItem } from '@/common/services/crm/appointments/types';
import { appointmentService } from '@/common/services/crm/appointments/appointment.service';

interface AppointmentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  services: ServiceItem[];
  staffList: StaffItem[];
  onSuccess?: () => void;
}

export default function AppointmentCreateDialog({
  isOpen,
  onClose,
  customers,
  services,
  staffList,
  onSuccess,
}: AppointmentCreateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default time: next hour rounded
  const defaultStartTime = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }, [isOpen]);

  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    serviceId: services[0]?.id || '',
    staffId: staffList[0]?.id || '',
    startTime: defaultStartTime,
    notes: '',
  });

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === formData.serviceId) || services[0];
  }, [services, formData.serviceId]);

  const calculatedEndTime = useMemo(() => {
    if (!formData.startTime || !selectedService) return '';
    try {
      const start = new Date(formData.startTime);
      if (isNaN(start.getTime())) return '';
      const end = new Date(start.getTime() + (selectedService.durationMinutes || 30) * 60 * 1000);
      return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [formData.startTime, selectedService]);

  if (!isOpen) return null;

  // Dialog dạng hàm gọi service trực tiếp (KHÔNG dùng useMutation)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const customerId = formData.customerId || customers[0]?.id;
    const serviceId = formData.serviceId || services[0]?.id;
    const staffId = formData.staffId || staffList[0]?.id;

    if (!customerId) {
      setErrorMsg('Vui lòng chọn khách hàng.');
      return;
    }
    if (!serviceId) {
      setErrorMsg('Vui lòng chọn dịch vụ.');
      return;
    }
    if (!staffId) {
      setErrorMsg('Vui lòng chọn nhân viên phụ trách.');
      return;
    }
    if (!formData.startTime) {
      setErrorMsg('Vui lòng chọn thời gian bắt đầu.');
      return;
    }

    setLoading(true);
    try {
      const isoStartTime = new Date(formData.startTime).toISOString();
      await appointmentService.createAppointment({
        customerId,
        serviceId,
        staffId,
        startTime: isoStartTime,
        notes: formData.notes?.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Đặt lịch hẹn mới</h3>
            <p className="text-xs text-slate-500 mt-0.5">Xếp lịch phục vụ cho khách hàng tại Salon</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khách hàng <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} - {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gói dịch vụ <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes}p - {Number(s.price).toLocaleString('vi-VN')} đ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kỹ thuật viên / Chuyên viên <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thời gian bắt đầu <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
            />
            {calculatedEndTime && (
              <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dự kiến hoàn thành lúc: {calculatedEndTime} ({selectedService?.durationMinutes} phút)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cho kỹ thuật viên</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Yêu cầu riêng, tiền sử dị ứng mỹ phẩm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
