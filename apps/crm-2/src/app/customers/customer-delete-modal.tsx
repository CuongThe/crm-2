'use client';

import { useState, useTransition } from 'react';
import { deleteCustomerAction } from './actions';

interface CustomerDeleteModalProps {
  customerId: string | null;
  customerName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CustomerDeleteModal({
  customerId,
  customerName,
  onClose,
  onSuccess,
}: CustomerDeleteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  if (!customerId) return null;

  const handleDelete = () => {
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteCustomerAction(customerId);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Không thể xóa khách hàng');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xóa khách hàng?</h3>
            <p className="text-xs text-slate-500">Thao tác này sẽ xóa hồ sơ khách hàng khỏi hệ thống.</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Bạn có chắc chắn muốn xóa khách hàng <strong className="text-slate-900">{customerName || `#${customerId}`}</strong>? Thao tác này không thể hoàn tác nếu khách hàng chưa có lịch hẹn ràng buộc.
        </p>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-md shadow-rose-500/20 disabled:opacity-50 transition"
          >
            {isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
