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
    
    // Poll every 30 seconds for unread updates (simplified realtime)
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-72 bg-surface-container-lowest fixed h-full flex flex-col border-r border-outline-variant/10 z-30">
      <div className="px-8 py-8">
        <Link to="/" className="text-2xl font-black tracking-tighter text-primary">NEXUS</Link>
        <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Seller Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 text-on-surface-variant overflow-y-auto">
        {navLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {link.icon}
              </span>
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
        <Link
          key="/admin-dashboard-chat"
          to="/admin-dashboard-chat"
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
            location.pathname.includes('/admin-dashboard-chat')
              ? 'bg-primary/5 text-primary font-semibold'
              : 'hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined"
              style={location.pathname.includes('/admin-dashboard-chat') ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              chat
            </span>
            <span className="text-sm">Pesan Pelanggan</span>
          </div>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          )}
        </Link>
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full mb-4 px-4 py-2 text-sm font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-all"
        >
          Logout
        </button>
        <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <span className="text-sm">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate max-w-[130px]">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Seller</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
