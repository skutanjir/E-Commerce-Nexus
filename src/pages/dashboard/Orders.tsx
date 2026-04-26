import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, Order } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

type StatusFilter = 'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-700',
};

const STATUS_ICON: Record<string, string> = {
  shipped: 'local_shipping',
  delivered: 'task_alt',
  completed: 'task_alt',
  cancelled: 'cancel',
  pending: 'pending_actions',
};

export default function UserDashboardOrders() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login-page'); return; }

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData as Profile);

        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              price_at_purchase,
              product:products (name, image_url)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersData) setAllOrders(ordersData as unknown as Order[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const filteredOrders = activeTab === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === activeTab || (activeTab === 'delivered' && o.status === 'completed'));

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Belum Bayar' },
    { key: 'shipped', label: 'Dikirim' },
    { key: 'delivered', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200/10 shadow-sm">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500">NEXUS</Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">Beranda</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/shop-catalogue">Toko</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/categories">Kategori</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/about-us">Tentang</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/shopping-cart" className="material-symbols-outlined text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors p-2">shopping_cart</Link>
            <div className="h-8 w-8 rounded-full overflow-hidden bg-primary-container flex items-center justify-center border-2 border-white flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <DashboardSidebar profile={profile} />

          <div className="md:col-span-9 space-y-6">
            <h1 className="text-2xl font-black text-on-surface tracking-tight">Pesanan Saya</h1>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-outline-variant/10 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex-1 py-4 px-3 text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-b-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {tab.label}
                    {tab.key === 'all' && allOrders.length > 0 && (
                      <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {allOrders.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-outline-variant/10">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">receipt_long</span>
                    <p className="mb-3">Belum ada pesanan di kategori ini.</p>
                    <Link to="/shop-catalogue" className="text-primary font-bold hover:underline">Mulai Belanja</Link>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const firstItem = order.order_items?.[0];
                    return (
                      <div key={order.id} className="p-6 hover:bg-surface-container-low transition-colors group">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary">
                              {STATUS_ICON[order.status] || 'receipt_long'}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-outline uppercase tracking-wider">Order ID</p>
                              <p className="text-sm font-bold text-on-surface font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal</p>
                              <p className="text-sm text-on-surface-variant">
                                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-700'}`}>
                              {STATUS_LABEL[order.status] || order.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                          <div className="flex gap-4 flex-1">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10 flex-shrink-0 flex items-center justify-center">
                              {firstItem?.product?.image_url ? (
                                <img src={firstItem.product.image_url} alt={firstItem.product?.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-outline">inventory_2</span>
                              )}
                            </div>
                            <div className="flex flex-col justify-center">
                              <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                                {firstItem?.product?.name || 'Beberapa Produk'}
                              </h4>
                              {firstItem && (
                                <p className="text-sm text-on-surface-variant">
                                  {firstItem.quantity} Barang × Rp {firstItem.price_at_purchase.toLocaleString('id-ID')}
                                </p>
                              )}
                              {order.order_items && order.order_items.length > 1 && (
                                <p className="text-xs text-outline mt-1">+{order.order_items.length - 1} produk lainnya</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="text-xs font-medium text-outline">Total Belanja</span>
                            <p className="text-xl font-black text-on-surface">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                            <div className="flex gap-2 mt-1">
                              {(order.status === 'delivered' || order.status === 'completed') && (
                                <button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-all">
                                  Beli Lagi
                                </button>
                              )}
                              <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all">
                                Lihat Detail
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
