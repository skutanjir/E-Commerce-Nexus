import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import SellerSidebar from '../../components/layout/SellerSidebar';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface TopProduct {
  name: string;
  total_sold: number;
  revenue: number;
  image_url: string | null;
}

export default function AdminReportsAnalytics() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0,
    pendingOrders: 0, shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login-page'); return; }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData?.role !== 'seller') { navigate('/user-dashboard'); return; }
        setProfile(profileData as Profile);

        const [
          { data: orders },
          { count: productCount },
          { count: userCount },
        ] = await Promise.all([
          supabase.from('orders').select('status, total_amount, order_items(quantity, price_at_purchase, product:products(name, image_url))'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        ]);

        if (orders) {
          const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0);
          setStats({
            totalRevenue,
            totalOrders: orders.length,
            totalProducts: productCount || 0,
            totalUsers: userCount || 0,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            shippedOrders: orders.filter(o => o.status === 'shipped').length,
            deliveredOrders: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
            cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
          });

          const productMap: Record<string, TopProduct> = {};
          orders.forEach(order => {
            (order.order_items as any[])?.forEach((item: any) => {
              const name = item.product?.name;
              if (!name) return;
              if (!productMap[name]) {
                productMap[name] = { name, total_sold: 0, revenue: 0, image_url: item.product?.image_url };
              }
              productMap[name].total_sold += item.quantity;
              productMap[name].revenue += item.quantity * item.price_at_purchase;
            });
          });
          const sorted = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
          setTopProducts(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const orderStatusData = [
    { label: 'Menunggu', value: stats.pendingOrders, color: 'bg-orange-500' },
    { label: 'Dikirim', value: stats.shippedOrders, color: 'bg-blue-500' },
    { label: 'Selesai', value: stats.deliveredOrders, color: 'bg-green-500' },
    { label: 'Dibatalkan', value: stats.cancelledOrders, color: 'bg-slate-400' },
  ];

  return (
    <div className="flex min-h-screen">
      <SellerSidebar profile={profile} />

      <main className="flex-1 ml-72 bg-surface-container-lowest p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Laporan & Analitik</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Ringkasan performa toko secara real-time.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Pendapatan', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: 'payments', color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Total Pesanan', value: stats.totalOrders, icon: 'shopping_bag', color: 'text-secondary', bg: 'bg-secondary/5' },
            { label: 'Total Produk', value: stats.totalProducts, icon: 'inventory', color: 'text-tertiary', bg: 'bg-tertiary/5' },
            { label: 'Total Pembeli', value: stats.totalUsers, icon: 'group', color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10 hover:-translate-y-1 transition-all">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mb-4 w-fit`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-on-surface mt-1 truncate">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h2 className="font-bold text-on-surface mb-6">Distribusi Status Pesanan</h2>
            <div className="space-y-4">
              {orderStatusData.map((item, i) => {
                const pct = stats.totalOrders > 0 ? Math.round((item.value / stats.totalOrders) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-on-surface">{item.label}</span>
                      <span className="text-sm font-bold text-on-surface">{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h2 className="font-bold text-on-surface mb-6">Produk Terlaris (berdasarkan pendapatan)</h2>
            {topProducts.length === 0 ? (
              <p className="text-on-surface-variant text-sm">Belum ada data penjualan.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-black text-on-surface-variant w-5 text-center">{i + 1}</span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant">{product.total_sold} terjual</p>
                    </div>
                    <p className="text-sm font-black text-primary flex-shrink-0">
                      Rp {product.revenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <h2 className="font-bold text-on-surface mb-2">Ringkasan Keuangan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Gross Revenue</p>
              <p className="text-2xl font-black text-on-surface">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Pesanan Berhasil</p>
              <p className="text-2xl font-black text-on-surface">{stats.deliveredOrders}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Rata-rata per Pesanan</p>
              <p className="text-2xl font-black text-on-surface">
                Rp {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString('id-ID') : '0'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
