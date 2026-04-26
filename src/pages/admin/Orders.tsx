import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, Order } from '../../types';
import SellerSidebar from '../../components/layout/SellerSidebar';

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

export default function AdminOrderManagement() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login-page'); return; }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData?.role !== 'seller') { navigate('/user-dashboard'); return; }
        setProfile(profileData as Profile);

        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            profile:profiles (full_name, email),
            order_items (
              quantity,
              price_at_purchase,
              product:products (name, image_url)
            )
          `)
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

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    }
  };

  const filteredOrders = allOrders
    .filter(o => activeTab === 'all' || o.status === activeTab || (activeTab === 'delivered' && o.status === 'completed'))
    .filter(o =>
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
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
    <div className="flex min-h-screen">
      <SellerSidebar profile={profile} />

      <main className="flex-1 ml-72 bg-surface-container-lowest p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Manajemen Pesanan</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Kelola dan perbarui status semua pesanan.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pesanan', value: allOrders.length, color: 'blue' },
            { label: 'Menunggu', value: allOrders.filter(o => o.status === 'pending').length, color: 'orange' },
            { label: 'Dikirim', value: allOrders.filter(o => o.status === 'shipped').length, color: 'blue' },
            { label: 'Selesai', value: allOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length, color: 'green' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container-low p-5 rounded-xl shadow-sm">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-on-surface">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="border-b border-outline-variant/10">
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari ID atau nama pelanggan..."
                  className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex border-t border-outline-variant/10 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex-1 py-3 px-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-b-2 border-primary text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant/10">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-on-surface-variant">Tidak ada pesanan ditemukan.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold font-mono text-primary">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-on-surface">{order.profile?.full_name || 'Guest'}</p>
                        <p className="text-xs text-on-surface-variant">{order.profile?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {order.order_items?.[0]?.product?.name || '—'}
                        {order.order_items && order.order_items.length > 1 && ` +${order.order_items.length - 1}`}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-700'}`}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          className="text-xs border border-outline-variant/20 rounded-lg px-2 py-1.5 bg-surface outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                        >
                          <option value="pending">Menunggu</option>
                          <option value="shipped">Dikirim</option>
                          <option value="delivered">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
