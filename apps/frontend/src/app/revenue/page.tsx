'use client';

import RevenueView from './revenue-view';

export default function RevenuePage() {
  return (
    <main className="min-h-screen bg-slate-50/70 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <RevenueView />
      </div>
    </main>
  );
}
