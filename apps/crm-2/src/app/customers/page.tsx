import { Suspense } from 'react';
import { fetchCustomers } from '@crm-2/data-access';
import { CustomerListResponse } from '@crm-2/shared-types';
import CustomerTable from './customer-table';

interface CustomersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function CustomersList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';

  let customerData: CustomerListResponse = {
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    data: [],
  };

  try {
    customerData = await fetchCustomers(page, 10, search);
  } catch (error) {
    console.error('Lỗi khi tải danh sách khách hàng:', error);
  }

  return (
    <CustomerTable
      initialData={customerData}
      currentSearch={search}
      currentPage={page}
    />
  );
}

export default function CustomersPage({ searchParams }: CustomersPageProps) {
  return (
    <main className="min-h-screen bg-slate-50/70 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản lý Khách hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu thông tin, theo dõi lịch sử ghé thăm và quản lý hồ sơ khách hàng.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400">
              <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p className="text-sm font-medium">Đang tải danh sách khách hàng...</p>
            </div>
          }
        >
          <CustomersList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
