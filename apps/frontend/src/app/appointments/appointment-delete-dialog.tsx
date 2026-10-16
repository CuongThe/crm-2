'use client';

import { useState } from 'react';
import { appointmentService } from '@/common/services/crm/appointments/appointment.service';

interface DeleteDialogProps {
  appointmentId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AppointmentDeleteDialog({
  appointmentId,
  onClose,
  onSuccess,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!appointmentId) return null;

  // Dialog dạng hàm gọi service trực tiếp (KHÔNG dùng useMutation)
  const handleDelete = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await appointmentService.deleteAppointment(appointmentId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể hủy lịch hẹn');
    } finally {
      setLoading(false);
    }
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
            <h3 className="text-lg font-bold text-slate-900">Hủy bỏ lịch hẹn?</h3>
            <p className="text-xs text-slate-500">Mã lịch hẹn: #{appointmentId}</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Bạn có chắc chắn muốn xóa lịch hẹn này khỏi danh sách? Thao tác này sẽ giải phóng thời gian của chuyên viên.
        </p>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
