import { Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';
import SellerSidebar from '../../components/layout/SellerSidebar';

function AdminShellInner() {
  const { adminProfile, adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <SellerSidebar profile={adminProfile} />
      <main className="flex-1 ml-72 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminShell() {
  return (
    <AdminProvider>
      <AdminShellInner />
    </AdminProvider>
  );
}
