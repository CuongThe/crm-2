'use client';

import { useEffect, useState } from 'react';
import { Customer } from '@crm-2/shared-types';
import { fetchCustomerById } from '@crm-2/data-access';

interface CustomerDetailsModalProps {
  customerId: string | null;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  customerId,
  onClose,
}: CustomerDetailsModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    setError('');

    fetchCustomerById(customerId)
      .then((data) => setCustomer(data))
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
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-sm">Đang tải hồ sơ khách hàng...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-600 text-sm">{error}</div>
        ) : customer ? (
          <div className="mt-4 space-y-6">
            {/* Thống kê thẻ KPI */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="text-xs font-medium text-slate-500">Tổng chi tiêu</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {Number(customer.totalSpent || 0).toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="text-xs font-medium text-slate-500">Số lần ghé thăm</p>
                <p className="text-lg font-bold text-indigo-600 mt-1">
                  {customer.visitCount || 0} lần
                </p>
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="bg-slate-50/60 p-4 rounded-xl space-y-2.5 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-semibold text-slate-900">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800">{customer.email || 'Chưa cung cấp'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giới tính:</span>
                <span className="text-slate-800">
                  {customer.gender === 'FEMALE' ? 'Nữ' : customer.gender === 'MALE' ? 'Nam' : 'Khác'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="text-slate-800">
                  {customer.dob ? new Date(customer.dob).toLocaleDateString('vi-VN') : 'Chưa cung cấp'}
                </span>
              </div>
              {customer.notes && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 block text-xs font-medium uppercase mb-1">Ghi chú:</span>
                  <p className="text-slate-700 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Lịch sử 5 cuộc hẹn gần nhất */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Cuộc hẹn gần đây ({customer.appointments?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {!customer.appointments || customer.appointments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                    Chưa có lịch hẹn nào được ghi nhận.
                  </p>
                ) : (
                  customer.appointments.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{item.service?.name}</p>
                        <p className="text-slate-400">
                          {new Date(item.startTime).toLocaleString('vi-VN')} • Nhân viên:{' '}
                          {item.staff?.fullName}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
