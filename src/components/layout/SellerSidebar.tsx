import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../lib/api';
import type { Profile } from '../../types';

interface Props {
  profile?: Profile | null;
}

const navLinks = [
  { to: '/admin-dashboard-overview', label: 'Overview', icon: 'dashboard' },
  { to: '/admin-product-management', label: 'Produk', icon: 'inventory_2' },
  { to: '/admin-category-management', label: 'Kategori', icon: 'category' },
  { to: '/admin-order-management', label: 'Pesanan', icon: 'shopping_cart' },
  { to: '/admin-discounts', label: 'Diskon & Promo', icon: 'local_offer' },
  { to: '/admin-reports-analytics', label: 'Laporan', icon: 'analytics' },
  { to: '/user-dashboard-profile', label: 'Profil Saya', icon: 'person' },
];

export default function SellerSidebar({ profile }: Props) {
  const location = useLocation();
  const { logout } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const { data } = await api.get('/chat/unread-count');
        setUnreadCount(data.unread_count || 0);
      } catch (err) {
        // ignore
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-72 bg-white text-slate-600 fixed h-full flex flex-col z-30 border-r border-slate-100 shadow-sm">
      <div className="px-8 py-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="text-white font-black text-xl italic">N</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-primary leading-none">NEXUS</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Dashboard</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
        </div>
        {navLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/5 text-primary font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {link.icon}
              </span>
              <span className="text-sm">{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              )}
            </Link>
          );
        })}
        
        <div className="px-4 mt-8 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Communication</p>
        </div>
        <Link
          key="/admin-dashboard-chat"
          to="/admin-dashboard-chat"
          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
            location.pathname.includes('/admin-dashboard-chat')
              ? 'bg-primary/5 text-primary font-bold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${location.pathname.includes('/admin-dashboard-chat') ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}
              style={location.pathname.includes('/admin-dashboard-chat') ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              chat
            </span>
            <span className="text-sm">Pesan Pelanggan</span>
          </div>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-lg">
              {unreadCount}
            </span>
          )}
        </Link>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-50">
        <div className="mb-4 bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <span className="text-sm">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Seller Member</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-error hover:bg-error/5 transition-all duration-300 font-medium group"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">logout</span>
          <span className="text-sm">Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}
