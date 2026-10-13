import { Suspense } from 'react';
import { connection } from 'next/server';
import { fetchRevenueReport, fetchServices } from '@crm-2/data-access';
import { RevenueReportResponse, ServiceItem } from '@crm-2/shared-types';
import RevenueView from './revenue-view';

interface RevenuePageProps {
  searchParams: Promise<{
    month?: string;
    serviceId?: string;
  }>;
}

async function RevenueContent({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; serviceId?: string }>;
}) {
  await connection();
  const resolvedParams = await searchParams;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const month = resolvedParams.month || defaultMonth;
  const serviceId = resolvedParams.serviceId || '';

  let report: RevenueReportResponse = {
    month,
    range: { fromDate: '', toDate: '' },
    summary: { totalRevenue: 0, totalCount: 0, averageOrderValue: 0 },
    dailyStats: [],
    serviceStats: [],
    appointments: [],
  };

  let services: ServiceItem[] = [];

  try {
    const [reportRes, servicesRes] = await Promise.all([
      fetchRevenueReport(month, serviceId),
      fetchServices(),
    ]);
    report = reportRes;
    services = servicesRes;
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu báo cáo doanh thu:', error);
  }

  return (
    <RevenueView
      initialReport={report}
      services={services}
      currentMonth={month}
      currentServiceId={serviceId}
    />
  );
}

export default function RevenuePage({ searchParams }: RevenuePageProps) {
  return (
    <main className="min-h-screen bg-slate-50/70 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center text-slate-400">
              <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p className="text-sm font-medium">Đang tổng hợp dữ liệu doanh thu...</p>
            </div>
          }
        >
          <RevenueContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
