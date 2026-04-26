import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Profile, Order } from "../../types";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    done: 0
  });

  useEffect(() => {
    async function getDashboardData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login-page");
          return;
        }

        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileData) {
          if (profileData.role === 'seller') {
            navigate("/admin-dashboard-overview");
            return;
          }
          setProfile(profileData as Profile);
        }

        // 2. Fetch Orders with Items and Product Info
        const { data: ordersData } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              product:products (
                name,
                image_url
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersData) {
          setOrders(ordersData as unknown as Order[]);
          
          // Calculate Stats
          const newStats = {
            total: ordersData.length,
            pending: ordersData.filter(o => o.status === 'pending').length,
            shipping: ordersData.filter(o => o.status === 'shipped').length,
            done: ordersData.filter(o => o.status === 'delivered').length
          };
          setStats(newStats);
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    getDashboardData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login-page");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/*  TopNavBar  */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200/10 dark:border-slate-800/10 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500">
            NEXUS
          </Link>
          <div className="hidden md:flex items-center space-x-8 font-inter body-md tracking-tight">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">Beranda</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/shop-catalogue">Toko</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/categories">Kategori</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/about-us">Tentang</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleLogout} className="text-sm font-bold text-on-surface-variant hover:text-error transition-colors">
              Logout
            </button>
            <button className="material-symbols-outlined text-slate-600 dark:text-slate-400 hover:opacity-80 transition-all duration-200 active:scale-95">
              shopping_cart
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden bg-primary-container flex items-center justify-center border-2 border-white">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/*  Main Content Layout  */}
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/*  Sidebar Navigation  */}
          <aside className="md:col-span-3 space-y-6">
            {/*  Profile Summary Card  */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-primary-fixed">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="User Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-container">
                      <span className="material-symbols-outlined text-4xl text-primary">person</span>
                    </div>
                  )}
                </div>
                <h2 className="text-on-surface font-bold text-lg tracking-tight">
                  {profile?.full_name || "Nexus User"}
                </h2>
                <p className="text-on-surface-variant text-sm uppercase tracking-wider font-bold">
                  {profile?.role === 'seller' ? 'Seller' : 'Gold Member'}
                </p>
              </div>
              <nav className="mt-8 space-y-1">
                <Link className="flex items-center gap-3 px-4 py-3 bg-surface-container-low text-primary font-semibold rounded-lg transition-all" to="/user-dashboard">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                  <span className="text-sm">Ringkasan</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all" to="/user-dashboard-orders">
                  <span className="material-symbols-outlined">shopping_bag</span>
                  <span className="text-sm">Pesanan</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all" to="/user-dashboard-wishlist">
                  <span className="material-symbols-outlined">favorite</span>
                  <span className="text-sm">Wishlist</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all" to="/user-dashboard-profile">
                  <span className="material-symbols-outlined">person</span>
                  <span className="text-sm">Profil</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all" to="/user-dashboard-addresses">
                  <span className="material-symbols-outlined">location_on</span>
                  <span className="text-sm">Alamat</span>
                </Link>
              </nav>
            </div>
            {/*  Promo Card  */}
            <div className="bg-primary overflow-hidden rounded-xl p-6 relative">
              <div className="relative z-10">
                <h4 className="text-white font-bold mb-2">Nexus Plus</h4>
                <p className="text-primary-fixed text-xs mb-4">Gratis ongkir tanpa batas ke seluruh Indonesia.</p>
                <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-fixed transition-colors">Upgrade Sekarang</button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                <span className="material-symbols-outlined text-8xl text-white">loyalty</span>
              </div>
            </div>
          </aside>

          {/*  Main Dashboard Area  */}
          <div className="md:col-span-9 space-y-8">
            {/*  Welcome Section  */}
            <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 z-10">
                <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tighter mb-2">
                  Halo, {profile?.full_name?.split(' ')[0] || "User"}!
                </h1>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                  Senang melihat Anda kembali. {stats.shipping > 0 ? `Ada ${stats.shipping} pesanan yang sedang dalam perjalanan.` : "Belum ada pesanan baru hari ini."}
                </p>
                <div className="mt-6 flex gap-4">
                  <Link to="/user-dashboard-orders" className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-all">
                    Lihat Pesanan
                  </Link>
                  <button className="bg-surface-container-lowest text-on-surface px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm border border-outline-variant/20 hover:bg-white transition-all">
                    Bantuan
                  </button>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  alt="Shopping Promo"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAevuqpKx5YQeBxmu94lL_b4fOLRubHhCm_PPhElLWRWHSfr_UwOo2jzwXI9vZdxGfn3rbv76kvaL3oGfdBVn1MV5SifAtwuXRDB8Y_wHMVuZVLeiUHunZAYcq2muwL0UVPIfDRBaoa91o-AageuhmQqff8U711u921c3DY-pwFx5jMEi7V8_RwjWetPGRwpTKvFw7ATrs8ncV1vQSu7LKQu1kKHE17s581SCfin5rLupMsnypU2Zhbhr9lBga82f21ATeSIJDN3Zw"
                />
              </div>
            </section>

            {/*  Stats Row  */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Pesanan", value: stats.total, icon: "receipt_long", color: "blue", tag: "TOTAL" },
                { label: "Menunggu Bayar", value: stats.pending, icon: "pending_actions", color: "orange", tag: "WAITING" },
                { label: "Dalam Pengiriman", value: stats.shipping, icon: "local_shipping", color: "blue", tag: "SHIPPING" },
                { label: "Selesai", value: stats.done, icon: "check_circle", color: "green", tag: "DONE" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{stat.icon}</span>
                    </div>
                    <span className={`text-[10px] font-bold text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded`}>
                      {stat.tag}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-on-surface tracking-tight">{stat.value}</div>
                  <div className="text-xs text-on-surface-variant font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </section>

            {/*  Recent Orders Table  */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="font-bold text-on-surface headline-sm">Pesanan Terbaru</h3>
                <Link className="text-primary text-sm font-bold hover:underline" to="/user-dashboard-orders">Lihat Semua</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low/50 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">ID Pesanan</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                          Belum ada pesanan. <Link to="/shop-catalogue" className="text-primary underline">Mulai belanja!</Link>
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => {
                        const firstItem = order.order_items?.[0];
                        return (
                          <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface flex items-center justify-center border border-outline-variant/10">
                                  {firstItem?.product?.image_url ? (
                                    <img src={firstItem.product.image_url} alt="Product" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="material-symbols-outlined text-outline">inventory_2</span>
                                  )}
                                </div>
                                <div className="text-sm font-bold text-on-surface truncate max-w-[150px]">
                                  {firstItem?.product?.name || "Beberapa Produk"}
                                  {order.order_items && order.order_items.length > 1 && ` (+${order.order_items.length - 1} lainnya)`}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant uppercase font-mono">
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 text-sm text-on-surface-variant">
                              {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-on-surface">
                              Rp {order.total_amount.toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                  'bg-slate-100 text-slate-700'}`}
                              >
                                {order.status === 'pending' ? 'Menunggu' :
                                 order.status === 'shipped' ? 'Dikirim' :
                                 order.status === 'delivered' ? 'Selesai' :
                                 order.status === 'completed' ? 'Selesai' :
                                 order.status === 'cancelled' ? 'Dibatalkan' : order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-primary font-bold text-xs hover:text-blue-800 transition-colors">
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/*  Footer  */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-100 dark:border-slate-900 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <div className="text-xl font-bold text-slate-900 dark:text-white">NEXUS</div>
            <p className="text-sm font-inter text-slate-500 dark:text-slate-400">Pengalaman belanja digital terbaik untuk gaya hidup modern.</p>
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Layanan Pelanggan</h5>
            <ul className="space-y-2">
              {['Hubungi Kami', 'Info Pengiriman', 'Retur & Penukaran'].map(link => (
                <li key={link}><a className="text-sm font-inter text-slate-500 hover:text-blue-500 transition-colors" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Hukum</h5>
            <ul className="space-y-2">
              {['Kebijakan Privasi', 'Syarat Layanan'].map(link => (
                <li key={link}><a className="text-sm font-inter text-slate-500 hover:text-blue-500 transition-colors" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Newsletter</h5>
            <div className="flex gap-2">
              <input className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs w-full outline-none focus:border-primary" placeholder="Email Anda" type="email" />
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Daftar</button>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-sm font-inter text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900 pt-8">
          © 2024 NEXUS E-commerce. Semua hak dilindungi.
        </div>
      </footer>
    </>
  );
}
