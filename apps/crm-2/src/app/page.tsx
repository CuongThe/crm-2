import { Suspense } from 'react';
import Link from 'next/link';
import {
  fetchDashboardStats,
  fetchAppointments,
  fetchCustomers,
} from '@crm-2/data-access';
import { DashboardStats } from '@crm-2/shared-types';

async function DashboardOverview() {
  const [stats, appointments, customersRes] = await Promise.all([
    fetchDashboardStats().catch(() => null),
    fetchAppointments().catch(() => []),
    fetchCustomers(1, 5).catch(() => ({
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      data: [],
    })),
  ]);

  const defaultStats: DashboardStats = stats || {
    range: { fromDate: '', toDate: '' },
    kpi: { totalRevenue: 0, todayAppointments: 0, newCustomers: 0 },
    statusDistribution: [],
    topServices: [],
  };

  const recentAppointments = appointments.slice(0, 5);
  const recentCustomers = customersRes.data || [];

  return (
    <div className="space-y-8">
      {/* Top Hero Greeting & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Trung tâm điều hành Salon & Spa (CRM-2)
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Tổng quan hoạt động
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Chào mừng bạn trở lại! Dưới đây là thống kê doanh thu, lịch phục vụ và lượng khách hàng mới nhất kết nối trực tiếp với NestJS & MySQL TypeORM.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Đặt lịch hẹn
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-xs border border-white/10 transition transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Thêm khách hàng
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Doanh thu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Doanh thu thực thu
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">
              {Number(defaultStats.kpi.totalRevenue).toLocaleString('vi-VN')} đ
            </h3>
            <p className="text-xs text-slate-400 mt-1">Từ các lịch hẹn đã hoàn thành</p>
          </div>
        </div>

        {/* Lịch hẹn hôm nay */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lịch hẹn hôm nay
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-indigo-600">
              {defaultStats.kpi.todayAppointments} cuộc hẹn
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cần phục vụ trong ngày</p>
          </div>
        </div>

        {/* Khách hàng mới */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Khách mới kỳ này
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-sky-600">
              {defaultStats.kpi.newCustomers} khách
            </h3>
            <p className="text-xs text-slate-400 mt-1">Gia tăng tệp khách hàng</p>
          </div>
        </div>

        {/* Tổng số khách hàng */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng khách hàng
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-purple-600">
              {customersRes.meta.total || 0} hồ sơ
            </h3>
            <p className="text-xs text-slate-400 mt-1">Đã lưu trong cơ sở dữ liệu</p>
          </div>
        </div>
      </div>

      {/* Analytics: Trạng thái lịch hẹn & Top Dịch Vụ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bổ trạng thái */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Phân bổ trạng thái lịch hẹn</h2>
              <p className="text-xs text-slate-400">Tỷ lệ các trạng thái cuộc hẹn trong kỳ</p>
            </div>
            <Link
              href="/appointments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Chi tiết →
            </Link>
          </div>

          <div className="space-y-3">
            {defaultStats.statusDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Chưa có dữ liệu thống kê trạng thái lịch hẹn.
              </p>
            ) : (
              defaultStats.statusDistribution.map((item) => (
                <div
                  key={item.status}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : item.status === 'CONFIRMED'
                          ? 'bg-sky-500'
                          : item.status === 'PENDING'
                          ? 'bg-amber-500'
                          : item.status === 'CANCELED'
                          ? 'bg-rose-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                      {item.status === 'PENDING'
                        ? 'Chờ xử lý (PENDING)'
                        : item.status === 'CONFIRMED'
                        ? 'Đã xác nhận (CONFIRMED)'
                        : item.status === 'COMPLETED'
                        ? 'Hoàn thành (COMPLETED)'
                        : item.status === 'CANCELED'
                        ? 'Đã hủy (CANCELED)'
                        : 'Không đến (NO_SHOW)'}
                    </span>
                  </div>
                  <span className="font-bold text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800">
                    {item.count} cuộc hẹn
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top dịch vụ phổ biến */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dịch vụ phổ biến nhất</h2>
              <p className="text-xs text-slate-400">Top 5 dịch vụ có lượt đặt cao nhất</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Bảng xếp hạng</span>
          </div>

          <div className="space-y-3">
            {defaultStats.topServices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Chưa có dữ liệu đặt dịch vụ nào trong kỳ.
              </p>
            ) : (
              defaultStats.topServices.map((service, index) => (
                <div
                  key={service.serviceId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                        {service.serviceName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {service.bookingCount} lượt đặt
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    {Number(service.totalRevenue).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Two columns: Lịch hẹn gần đây & Khách hàng gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch hẹn gần đây (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Lịch hẹn gần đây</h2>
              <p className="text-xs text-slate-400">Danh sách các cuộc hẹn phục vụ mới nhất</p>
            </div>
            <Link
              href="/appointments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Quản lý tất cả ({appointments.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">Thời gian</th>
                  <th className="py-2.5 px-3 text-left">Khách hàng</th>
                  <th className="py-2.5 px-3 text-left">Dịch vụ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Chưa có lịch hẹn nào gần đây.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {new Date(app.startTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {new Date(app.startTime).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{app.customer?.fullName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{app.service?.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : app.status === 'CONFIRMED'
                              ? 'bg-sky-50 text-sky-700'
                              : app.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khách hàng mới nhất (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Khách hàng mới</h2>
              <p className="text-xs text-slate-400">Hồ sơ khách hàng vừa đăng ký</p>
            </div>
            <Link
              href="/customers"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {recentCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Chưa có khách hàng nào.
              </p>
            ) : (
              recentCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {cust.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{cust.fullName}</p>
                      <p className="text-[11px] text-slate-400">{cust.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {cust.visitCount || 0} lượt
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="py-24 text-center text-slate-400">
              <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p className="text-sm font-medium">Đang tải bảng điều khiển tổng quan...</p>
            </div>
          }
        >
          <DashboardOverview />
        </Suspense>
      </div>
    </main>
  );
}
