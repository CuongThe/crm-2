'use client';

import { useState, useTransition } from 'react';
import { deleteAppointmentAction } from './actions';

interface AppointmentDeleteModalProps {
  appointmentId: string | null;
  customerName?: string;
  serviceName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AppointmentDeleteModal({
  appointmentId,
  customerName,
  serviceName,
  onClose,
  onSuccess,
}: AppointmentDeleteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  if (!appointmentId) return null;

  const handleDelete = () => {
    setErrorMsg('');
    startTransition(async () => {
      const res = await deleteAppointmentAction(appointmentId);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Không thể xóa lịch hẹn này');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xóa Lịch Hẹn?</h3>
            <p className="text-xs text-slate-500">Mã lịch hẹn: #{appointmentId}</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Bạn có chắc chắn muốn xóa vĩnh viễn lịch hẹn dịch vụ{' '}
          <strong className="text-slate-900">{serviceName}</strong> cho khách hàng{' '}
          <strong className="text-slate-900">{customerName}</strong>?
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
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-md shadow-rose-500/20 disabled:opacity-50 transition cursor-pointer"
          >
            {isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
