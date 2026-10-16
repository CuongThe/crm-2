'use client';

import { useEffect, useState } from 'react';
import { Customer } from '@/common/services/crm/customers/types';
import { customerService } from '@/common/services/crm/customers/customer.service';

interface CustomerDetailsDialogProps {
  customerId: string | null;
  onClose: () => void;
}

export default function CustomerDetailsDialog({
  customerId,
  onClose,
}: CustomerDetailsDialogProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy dữ liệu chi tiết bằng useEffect gọi service trực tiếp
  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    setError('');

    customerService
      .getCustomerById(customerId)
      .then((res) => {
        setCustomer(res);
      })
      .catch((err) => setError(err.message || 'Lỗi khi tải thông tin chi tiết'))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {customer?.fullName?.charAt(0) || 'K'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {customer?.fullName || 'Đang tải...'}
              </h3>
              <p className="text-xs text-slate-500">Mã khách hàng: #{customerId}</p>
            </div>
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

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-sm">Đang tải chi tiết hồ sơ...</p>
          </div>
        ) : error ? (
          <div className="my-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        ) : customer ? (
          <div className="mt-6 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Số điện thoại</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{customer.phone}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{customer.email || 'Chưa cập nhật'}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Giới tính</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {customer.gender === 'FEMALE' ? 'Nữ' : customer.gender === 'MALE' ? 'Nam' : 'Khác'}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Ngày sinh</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {customer.dob ? new Date(customer.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {/* Spending & Visit Stats */}
            <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60">
              <div>
                <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">Tổng chi tiêu</p>
                <p className="text-xl font-bold text-indigo-950 mt-1">
                  {Number(customer.totalSpent || 0).toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">Lượt ghé thăm</p>
                <p className="text-xl font-bold text-indigo-950 mt-1">{customer.visitCount || 0} lần</p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ghi chú & Sở thích</p>
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                {customer.notes || 'Không có ghi chú nào.'}
              </div>
            </div>

            {/* Appointment History List */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Lịch sử cuộc hẹn ({customer.appointments?.length || 0})
              </p>
              {customer.appointments && customer.appointments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customer.appointments.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{app.service?.name || 'Dịch vụ'}</p>
                        <p className="text-slate-500 mt-0.5">
                          {new Date(app.startTime).toLocaleString('vi-VN')} • NV: {app.staff?.fullName || 'Chưa phân công'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{Number(app.price).toLocaleString('vi-VN')} đ</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'CANCELED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Khách hàng chưa có cuộc hẹn nào.</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
