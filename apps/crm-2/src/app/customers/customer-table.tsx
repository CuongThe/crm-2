'use client';

import { useState } from 'react';
import { Customer, CustomerListResponse } from '@crm-2/shared-types';
import CustomerModal from './customer-modal';
import CustomerDetailsModal from './customer-details-modal';
import CustomerDeleteModal from './customer-delete-modal';
import { useRouter } from 'next/navigation';

interface CustomerTableProps {
  initialData: CustomerListResponse;
  currentSearch?: string;
  currentPage: number;
}

export default function CustomerTable({
  initialData,
  currentSearch = '',
  currentPage = 1,
}: CustomerTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [detailsCustomerId, setDetailsCustomerId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm.trim()) query.set('search', searchTerm.trim());
    query.set('page', '1');
    router.push(`/customers?${query.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const query = new URLSearchParams();
    if (currentSearch) query.set('search', currentSearch);
    query.set('page', String(newPage));
    router.push(`/customers?${query.toString()}`);
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition cursor-pointer"
          >
            Tìm
          </button>
        </form>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm khách hàng mới
        </button>
      </div>

      {/* Customer List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Khách hàng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Giới tính</th>
                <th className="py-3.5 px-4 text-right">Lượt đến</th>
                <th className="py-3.5 px-4 text-right">Tổng chi tiêu</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {initialData.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="font-medium text-slate-600">Không tìm thấy khách hàng nào</p>
                      <p className="text-xs text-slate-400">
                        {currentSearch
                          ? 'Thử tìm kiếm với số điện thoại hoặc tên khác.'
                          : 'Nhấn vào "Thêm khách hàng mới" để tạo hồ sơ đầu tiên.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialData.data.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {c.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.fullName}</p>
                          <p className="text-[11px] text-slate-400">ID: #{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{c.phone}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {c.email || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          c.gender === 'FEMALE'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : c.gender === 'MALE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {c.gender === 'FEMALE' ? 'Nữ' : c.gender === 'MALE' ? 'Nam' : 'Khác'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-indigo-600">
                      {c.visitCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      {Number(c.totalSpent || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setDetailsCustomerId(c.id)}
                          title="Xem chi tiết"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          title="Chỉnh sửa"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: c.id, name: c.fullName })}
                          title="Xóa"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {initialData.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Trang <strong>{currentPage}</strong> trên <strong>{initialData.meta.totalPages}</strong> (Tổng {initialData.meta.total} khách)
            </span>
            <div className="inline-flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                ← Trước
              </button>
              <button
                disabled={currentPage >= initialData.meta.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSuccess={() => router.refresh()}
      />

      <CustomerDetailsModal
        customerId={detailsCustomerId}
        onClose={() => setDetailsCustomerId(null)}
      />

      <CustomerDeleteModal
        customerId={deleteTarget?.id || null}
        customerName={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
