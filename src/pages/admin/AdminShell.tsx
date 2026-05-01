import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';
import SellerSidebar from '../../components/layout/SellerSidebar';
import DashboardNav from '../../components/layout/DashboardNav';

function AdminShellInner() {
  const { adminProfile, adminLoading } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant/10 z-40 flex items-center px-4 justify-between">
        <span className="text-xl font-black tracking-tighter text-primary">NEXUS</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SellerSidebar profile={adminProfile} />
      </div>

      <main className="flex-1 w-full lg:ml-72 min-h-screen flex flex-col pt-16 lg:pt-24">
        <div className="hidden lg:block">
          <DashboardNav profile={adminProfile} />
        </div>
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>
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
