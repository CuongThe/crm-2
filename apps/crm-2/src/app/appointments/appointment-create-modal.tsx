'use client';

import { useState, useTransition, useMemo } from 'react';
import { Customer, ServiceItem, StaffItem } from '@crm-2/shared-types';
import { createAppointmentAction } from './actions';

interface AppointmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  services: ServiceItem[];
  staffList: StaffItem[];
  onSuccess?: () => void;
}

export default function AppointmentCreateModal({
  isOpen,
  onClose,
  customers,
  services,
  staffList,
  onSuccess,
}: AppointmentCreateModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  // Default time: next hour rounded
  const defaultStartTime = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    // Format to YYYY-MM-DDTHH:mm
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customerId) {
      setErrorMsg('Vui lòng chọn khách hàng.');
      return;
    }
    if (!formData.serviceId) {
      setErrorMsg('Vui lòng chọn dịch vụ.');
      return;
    }
    if (!formData.staffId) {
      setErrorMsg('Vui lòng chọn nhân viên phụ trách.');
      return;
    }
    if (!formData.startTime) {
      setErrorMsg('Vui lòng chọn thời gian bắt đầu.');
      return;
    }

    startTransition(async () => {
      // Convert to ISO 8601 string
      const isoStartTime = new Date(formData.startTime).toISOString();

      const res = await createAppointmentAction({
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        staffId: formData.staffId,
        startTime: isoStartTime,
        notes: formData.notes?.trim() || undefined,
      });

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Lỗi khi đặt lịch hẹn');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Đặt Lịch Hẹn Mới</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tạo cuộc hẹn dịch vụ và sắp xếp lịch phục vụ cho nhân viên
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-xs">
              <span className="font-semibold block">Không thể tạo lịch hẹn:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Chọn Khách Hàng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Khách hàng <span className="text-rose-500">*</span>
            </label>
            {customers.length === 0 ? (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                Chưa có khách hàng nào trong hệ thống. Vui lòng tạo khách hàng trước.
              </p>
            ) : (
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-900 bg-white transition"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - {c.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Chọn Dịch Vụ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Dịch vụ <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-900 bg-white transition"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} phút - {Number(s.price).toLocaleString('vi-VN')} đ)
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Kỹ Thuật Viên / Nhân Viên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nhân viên phụ trách <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-900 bg-white transition"
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.email})
                </option>
              ))}
            </select>
          </div>

          {/* Thời Gian Bắt Đầu */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Thời gian bắt đầu <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-900 bg-white transition"
            />
          </div>

          {/* Card xem trước chi tiết lịch */}
          {selectedService && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-indigo-950">
              <div>
                <span className="text-indigo-600 font-semibold block uppercase text-[10px]">Thời lượng dự kiến</span>
                <span>{selectedService.durationMinutes} phút {calculatedEndTime && `(Kết thúc: ~${calculatedEndTime})`}</span>
              </div>
              <div className="text-right">
                <span className="text-indigo-600 font-semibold block uppercase text-[10px]">Tạm tính</span>
                <span className="font-bold text-sm text-indigo-700">
                  {Number(selectedService.price).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          )}

          {/* Ghi Chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Yêu cầu thêm của khách (VD: tạo kiểu nhẹ nhàng)..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-900 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending || customers.length === 0}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Đang kiểm tra & tạo lịch...
                </>
              ) : (
                'Xác nhận đặt lịch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
