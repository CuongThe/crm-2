'use client';

import { useState, useTransition } from 'react';
import { updateAppointmentStatusAction } from './actions';
import { AppointmentStatusType } from '@crm-2/shared-types';

const statusLabels: Record<AppointmentStatusType, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
  NO_SHOW: 'Không đến',
};

const statusStyles: Record<AppointmentStatusType, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400',
  CANCELED: 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-400',
  NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200 focus:ring-slate-400',
};

export default function StatusSelector({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: AppointmentStatusType;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<AppointmentStatusType>(currentStatus);

  const isLocked = status === 'COMPLETED' || status === 'CANCELED';

  const handleChange = (newStatus: AppointmentStatusType) => {
    const prev = status;
    setStatus(newStatus);
    startTransition(async () => {
      const res = await updateAppointmentStatusAction(id, newStatus);
      if (!res.success) {
        alert(res.error || 'Lỗi khi cập nhật trạng thái');
        setStatus(prev);
      }
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={status}
        disabled={isPending || isLocked}
        onChange={(e) => handleChange(e.target.value as AppointmentStatusType)}
        className={`text-xs font-semibold rounded-full border px-3 py-1 pr-7 appearance-none cursor-pointer focus:outline-hidden focus:ring-2 disabled:cursor-not-allowed disabled:opacity-75 transition-all ${
          statusStyles[status] || 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        {(Object.keys(statusLabels) as AppointmentStatusType[]).map((key) => (
          <option key={key} value={key}>
            {statusLabels[key]}
          </option>
        ))}
      </select>

      {/* Down arrow icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
        {isPending ? (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
