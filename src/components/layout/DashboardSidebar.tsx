import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import type { Profile } from '../../types';

interface DashboardSidebarProps {
  profile: Profile | null;
}

const getAvatarSrc = (url: string | undefined | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;

  // Ambil Base URL Backend dari env untuk gambar profile upload
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl}${url}`;
};

export default function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const { logout } = useUser();
  const location = useLocation();
  const isSeller = profile?.role === 'seller';

  const userLinks = [
    { to: '/user-dashboard', label: 'Ringkasan', icon: 'dashboard' },
    { to: '/user-dashboard-orders', label: 'Pesanan', icon: 'shopping_bag' },
    { to: '/user-dashboard-chat', label: 'Chat', icon: 'chat' },
    { to: '/user-dashboard-wishlist', label: 'Favorit', icon: 'favorite' },
    { to: '/user-dashboard-profile', label: 'Profil', icon: 'person' },
    { to: '/user-dashboard-addresses', label: 'Alamat', icon: 'location_on' },
  ];

  const sellerLinks = [
    { to: '/admin-dashboard-overview', label: 'Ringkasan', icon: 'monitoring' },
    { to: '/admin-dashboard-products', label: 'Produk', icon: 'inventory_2' },
    { to: '/admin-dashboard-categories', label: 'Kategori', icon: 'category' },
    { to: '/admin-dashboard-orders', label: 'Pesanan', icon: 'receipt_long' },
    { to: '/admin-profile', label: 'Profil', icon: 'person' },
  ];

  const links = isSeller ? sellerLinks : userLinks;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="md:col-span-3 space-y-6">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6 sticky top-24">
        {/* Profile Snapshot */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-3">
            {profile?.avatar_url ? (
              <img
                src={getAvatarSrc(profile.avatar_url)}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-surface-container-low shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface-container-low">
                <span className="material-symbols-outlined text-3xl text-primary">person</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center" title="Online">
            </div>
          </div>
          <h2 className="font-bold text-on-surface text-lg">{profile?.full_name || 'Pengguna'}</h2>
          <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
            {profile?.role === 'seller' ? 'Seller' : (profile?.role || 'Member')}
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="mt-8 pt-6 border-t border-outline-variant/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-error hover:bg-error/10 transition-colors border border-error/20"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar Akun
          </button>
        </div>
      </div>
    </aside>
  );
}
