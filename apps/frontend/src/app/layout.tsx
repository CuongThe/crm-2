import './global.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'CRM Pro 2 - Quản lý Salon & Spa',
  description: 'Hệ thống quản lý khách hàng, lịch hẹn và doanh thu tiệm Salon & Spa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50/70 text-slate-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
