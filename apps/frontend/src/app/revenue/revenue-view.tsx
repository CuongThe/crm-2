'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { RevenueReportResponse } from '@/common/services/crm/revenue/types';
import { ServiceItem } from '@/common/services/crm/appointments/types';
import { revenueService } from '@/common/services/crm/revenue/revenue.service';

export default function RevenueView() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [report, setReport] = useState<RevenueReportResponse>({
    month: defaultMonth,
    range: { fromDate: '', toDate: '' },
    summary: { totalRevenue: 0, totalCount: 0, averageOrderValue: 0 },
    dailyStats: [],
    serviceStats: [],
    appointments: [],
  });

  // 12 tháng gần nhất
  const monthOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      options.push({ value: val, label });
    }
    return options;
  }, []);

  // Lấy dữ liệu ở trang admin: Gọi service trong useEffect (KHÔNG dùng useQuery)
  const fetchRevenueData = useCallback(async (month: string, serviceId?: string) => {
    setLoading(true);
    setError('');
    try {
      const [reportRes, servicesRes] = await Promise.all([
        revenueService.getRevenueReport({ month, serviceId: serviceId || undefined }),
        revenueService.getServices(),
      ]);
      setReport(reportRes);
      setServices(servicesRes || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData(selectedMonth, selectedServiceId);
  }, [selectedMonth, selectedServiceId, fetchRevenueData]);

  const handleFilterChange = (newMonth: string, newServiceId: string) => {
    setSelectedMonth(newMonth);
    setSelectedServiceId(newServiceId);
  };

  const handleReset = () => {
    const defaultM = monthOptions[0]?.value || defaultMonth;
    setSelectedMonth(defaultM);
    setSelectedServiceId('');
  };

  // Tính giá trị doanh thu cao nhất của một ngày để làm tỷ lệ chiều cao biểu đồ cột
  const maxDailyRevenue = useMemo(() => {
    if (!report.dailyStats || report.dailyStats.length === 0) return 1;
    const max = Math.max(...report.dailyStats.map((d) => d.revenue));
    return max > 0 ? max : 1;
  }, [report.dailyStats]);

  const selectedServiceName = useMemo(() => {
    if (!selectedServiceId) return 'Tất cả dịch vụ';
    const found = services.find((s) => s.id === selectedServiceId);
    return found ? found.name : 'Dịch vụ đã chọn';
  }, [services, selectedServiceId]);

  return (
    <div className="space-y-8">
      {/* Top Banner & Tiêu đề */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Báo cáo tài chính & Doanh số
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Thống kê Doanh thu
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Theo dõi chi tiết nguồn thu từ các lịch hẹn đã hoàn thành theo từng tháng và từng loại dịch vụ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-right">
              <span className="block text-xs text-slate-300">Đang xem kỳ:</span>
              <span className="font-bold text-white text-sm">
                {monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            {/* Lọc theo Tháng */}
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Chọn tháng thống kê
              </label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  disabled={loading}
                  onChange={(e) => handleFilterChange(e.target.value, selectedServiceId)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer appearance-none"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lọc theo Dịch vụ */}
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Lọc theo dịch vụ
              </label>
              <div className="relative">
                <select
                  value={selectedServiceId}
                  disabled={loading}
                  onChange={(e) => handleFilterChange(selectedMonth, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer appearance-none"
                >
                  <option value="">Tất cả dịch vụ</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({Number(s.price).toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {(selectedServiceId || selectedMonth !== (monthOptions[0]?.value || '')) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Thẻ KPI tổng kết */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng doanh thu tháng
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {Number(report.summary.totalRevenue || 0).toLocaleString('vi-VN')} đ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phạm vi: {selectedServiceName}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng đơn hoàn thành
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.summary.totalCount || 0} đơn
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lịch hẹn đã phục vụ thành công
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Giá trị trung bình / đơn
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {Number(report.summary.averageOrderValue || 0).toLocaleString('vi-VN')} đ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Chi tiêu trung bình mỗi lượt khách
            </p>
          </div>
        </div>
      </div>

      {/* THỐNG KÊ DẠNG CỘT: Biểu đồ doanh thu từng ngày trong tháng */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Biểu đồ doanh thu theo ngày (Dạng cột)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ doanh thu thực thu theo từng ngày trong {selectedMonth}
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
              <span>Có phát sinh doanh thu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-200"></span>
              <span>Không có doanh thu</span>
            </div>
          </div>
        </div>

        {/* Khung vẽ biểu đồ cột */}
        {report.dailyStats.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Chưa có dữ liệu thống kê ngày.</div>
        ) : (
          <div className="pt-8 pb-2">
            <div className="h-64 flex items-end gap-1.5 sm:gap-2 px-1 border-b border-slate-200 overflow-x-auto">
              {report.dailyStats.map((item) => {
                const hasRevenue = item.revenue > 0;
                const heightPercent =
                  maxDailyRevenue > 0 && hasRevenue
                    ? Math.max(12, Math.round((item.revenue / maxDailyRevenue) * 100))
                    : 3;

                return (
                  <div
                    key={item.day}
                    className="group relative flex-1 min-w-[20px] sm:min-w-[26px] flex flex-col items-center h-full justify-end"
                  >
                    {/* Tooltip khi hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap text-center">
                        <p className="font-bold text-indigo-300">Ngày {item.day} ({item.date})</p>
                        <p className="font-extrabold text-white">
                          {Number(item.revenue).toLocaleString('vi-VN')} đ
                        </p>
                        <p className="text-slate-300 text-[10px]">{item.count} lượt hoàn thành</p>
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                    </div>

                    {/* Thanh cột */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        hasRevenue
                          ? 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400 shadow-xs'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    ></div>

                    {/* Nhãn ngày */}
                    <span
                      className={`text-[10px] mt-2 block font-medium ${
                        hasRevenue ? 'text-indigo-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BẢNG PHÂN BỔ DOANH THU THEO DỊCH VỤ DẠNG CỘT */}
      {report.serviceStats && report.serviceStats.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Phân bổ doanh thu theo dịch vụ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tỷ trọng doanh thu và số lượt phục vụ của từng dịch vụ trong tháng
            </p>
          </div>

          <div className="space-y-3">
            {report.serviceStats.map((svc, idx) => (
              <div
                key={svc.serviceId}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{svc.serviceName}</span>
                    <span className="text-slate-400 text-xs">({svc.count} lượt)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {Number(svc.revenue).toLocaleString('vi-VN')} đ
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                      {svc.percentage}%
                    </span>
                  </div>
                </div>

                {/* Thanh tỷ trọng phần trăm dạng cột ngang */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(svc.percentage, 100)}%` }}
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BẢNG THỐNG KÊ DOANH THU CHI TIẾT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Bảng kê chi tiết các giao dịch hoàn thành
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách chi tiết từng lịch hẹn phát sinh doanh thu ({report.appointments?.length || 0} giao dịch)
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60 self-start sm:self-auto">
            Trạng thái: COMPLETED
          </span>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Mã giao dịch</th>
                <th className="py-3.5 px-4">Thời gian hoàn thành</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Dịch vụ thực hiện</th>
                <th className="py-3.5 px-4">Nhân viên phục vụ</th>
                <th className="py-3.5 px-4 text-right">Doanh thu</th>
                <th className="py-3.5 px-6">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Đang tải dữ liệu giao dịch...
                  </td>
                </tr>
              ) : !report.appointments || report.appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m0 0l-6-6m6 6H3" />
                    </svg>
                    Không có giao dịch hoàn thành nào trong khoảng thời gian và dịch vụ đã chọn.
                  </td>
                </tr>
              ) : (
                report.appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 text-xs">
                      #{app.id}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <span className="font-semibold block text-slate-900">
                        {new Date(app.startTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(app.startTime).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold block text-slate-900">
                        {app.customer?.fullName || 'Khách vãng lai'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {app.customer?.phone || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-medium text-slate-800">
                        {app.service?.name || 'Dịch vụ'}
                      </span>
                      {app.service?.durationMinutes ? (
                        <span className="block text-[11px] text-slate-400">
                          {app.service.durationMinutes} phút
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {app.staff?.fullName || 'Chưa chỉ định'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-right font-bold text-slate-900">
                      {Number(app.price || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500 italic max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Hàng tổng kết Footer */}
            {!loading && report.appointments && report.appointments.length > 0 && (
              <tfoot className="bg-slate-50/90 font-bold text-xs text-slate-800 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={5} className="py-4 px-6 text-right uppercase tracking-wider text-slate-600">
                    Tổng cộng ({report.appointments.length} giao dịch):
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-indigo-700 font-black">
                    {Number(report.summary?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-4 px-6"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
