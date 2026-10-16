'use client';

import CustomerTable from './customer-table';

export default function CustomersPage() {
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

        <CustomerTable />
      </div>
    </main>
  );
}
