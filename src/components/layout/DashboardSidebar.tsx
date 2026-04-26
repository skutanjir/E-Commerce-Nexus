import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

interface Props {
  profile: Profile | null;
}

const navLinks = [
  { to: '/user-dashboard', label: 'Ringkasan', icon: 'dashboard' },
  { to: '/user-dashboard-orders', label: 'Pesanan', icon: 'shopping_bag' },
  { to: '/user-dashboard-wishlist', label: 'Wishlist', icon: 'favorite' },
  { to: '/user-dashboard-profile', label: 'Profil', icon: 'person' },
  { to: '/user-dashboard-addresses', label: 'Alamat', icon: 'location_on' },
];

export default function DashboardSidebar({ profile }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login-page');
  };

  return (
    <aside className="md:col-span-3 space-y-6">
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-primary-fixed">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-container">
                <span className="material-symbols-outlined text-4xl text-primary">person</span>
              </div>
            )}
          </div>
          <h2 className="text-on-surface font-bold text-lg tracking-tight">
            {profile?.full_name || 'Nexus User'}
          </h2>
          <p className="text-on-surface-variant text-sm uppercase tracking-wider font-bold">
            {profile?.role === 'seller' ? 'Seller' : 'Gold Member'}
          </p>
        </div>
        <nav className="mt-8 space-y-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-surface-container-low text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
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
        </nav>
      </div>

      <div className="bg-primary overflow-hidden rounded-xl p-6 relative">
        <div className="relative z-10">
          <h4 className="text-white font-bold mb-2">Nexus Plus</h4>
          <p className="text-primary-fixed text-xs mb-4">Gratis ongkir tanpa batas ke seluruh Indonesia.</p>
          <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-fixed transition-colors">
            Upgrade Sekarang
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
          <span className="material-symbols-outlined text-8xl text-white">loyalty</span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-2.5 text-sm font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-all"
      >
        Logout
      </button>
    </aside>
  );
}
