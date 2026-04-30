import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";
import type { Order } from "../../types";
import DashboardNav from "../../components/layout/DashboardNav";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, profile, authLoading, logout } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, shipping: 0, done: 0 });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login-page"); return; }
    if (profile?.role === "seller") { navigate("/admin-dashboard-overview"); return; }

    async function fetchOrders() {
      try {
        setLoading(true);
        const { data } = await api.get('/orders');

        if (data) {
          setOrders(data);
          setStats({
            total: data.length,
            pending: data.filter((o: Order) => o.status === "pending").length,
            shipping: data.filter((o: Order) => o.status === "shipped").length,
            done: data.filter((o: Order) => o.status === "delivered" || o.status === "completed").length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, profile, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login-page");
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <DashboardNav profile={profile} />

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <aside className="md:col-span-3 space-y-6">
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
                  {profile?.full_name || "Pengguna"}
                </h2>
                <p className="text-on-surface-variant text-sm uppercase tracking-wider font-bold">
                  {profile?.role === "seller" ? "Seller" : "Member"}
                </p>
              </div>
              <nav className="mt-8 space-y-1">
                <Link className="flex items-center gap-3 px-4 py-3 bg-surface-container-low text-primary font-semibold rounded-lg" to="/user-dashboard">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                  <span className="text-sm">Ringkasan</span>
                </Link>
                {[
                  { to: "/user-dashboard-orders", label: "Pesanan", icon: "shopping_bag" },
                  { to: "/user-dashboard-wishlist", label: "Favorit", icon: "favorite" },
                  { to: "/user-dashboard-profile", label: "Profil", icon: "person" },
                  { to: "/user-dashboard-addresses", label: "Alamat", icon: "location_on" },
                ].map(link => (
                  <Link key={link.to} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all" to={link.to}>
                    <span className="material-symbols-outlined">{link.icon}</span>
                    <span className="text-sm">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-sm font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-all"
            >
              Logout
            </button>
          </aside>

          <div className="md:col-span-9 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 z-10">
                <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tighter mb-2">
                  Halo, {profile?.full_name?.split(" ")[0] || "Pengguna"}!
                </h1>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                  {stats.shipping > 0
                    ? `Ada ${stats.shipping} pesanan yang sedang dalam perjalanan.`
                    : "Belum ada pesanan baru hari ini."}
                </p>
                <div className="mt-6 flex gap-4">
                  <Link
                    to="/user-dashboard-orders"
                    className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-all"
                  >
                    Lihat Pesanan
                  </Link>
                  <Link
                    to="/shop-catalogue"
                    className="bg-surface-container-lowest text-on-surface px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm border border-outline-variant/20 hover:bg-white transition-all"
                  >
                    Belanja
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  alt="Shopping"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAevuqpKx5YQeBxmu94lL_b4fOLRubHhCm_PPhElLWRWHSfr_UwOo2jzwXI9vZdxGfn3rbv76kvaL3oGfdBVn1MV5SifAtwuXRDB8Y_wHMVuZVLeiUHunZAYcq2muwL0UVPIfDRBaoa91o-AageuhmQqff8U711u921c3DY-pwFx5jMEi7V8_RwjWetPGRwpTKvFw7ATrs8ncV1vQSu7LKQu1kKHE17s581SCfin5rLupMsnypU2Zhbhr9lBga82f21ATeSIJDN3Zw"
                />
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Pesanan", value: stats.total, icon: "receipt_long", color: "blue" },
                { label: "Menunggu", value: stats.pending, icon: "pending_actions", color: "orange" },
                { label: "Dalam Pengiriman", value: stats.shipping, icon: "local_shipping", color: "blue" },
                { label: "Selesai", value: stats.done, icon: "check_circle", color: "green" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-5 rounded-xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{stat.icon}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-on-surface tracking-tight">{stat.value}</div>
                  <div className="text-xs text-on-surface-variant font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </section>

            <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="font-bold text-on-surface">Pesanan Terbaru</h3>
                <Link className="text-primary text-sm font-bold hover:underline" to="/user-dashboard-orders">Lihat Semua</Link>
              </div>
              {loading ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-surface-container-low animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low/50 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Produk</th>
                        <th className="px-6 py-4">ID Pesanan</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                            Belum ada pesanan.{" "}
                            <Link to="/shop-catalogue" className="text-primary underline">Mulai belanja!</Link>
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
                                    {order.order_items && order.order_items.length > 1 && ` (+${order.order_items.length - 1})`}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant uppercase font-mono">
                                #{order.id.slice(0, 8)}
                              </td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant">
                                {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-on-surface">
                                Rp {Number(order.total_amount).toLocaleString("id-ID")}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  order.status === "delivered" || order.status === "completed" ? "bg-green-100 text-green-700" :
                                  order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                                  order.status === "pending" ? "bg-orange-100 text-orange-700" :
                                  "bg-slate-100 text-slate-700"
                                }`}>
                                  {order.status === "pending" ? "Menunggu" :
                                   order.status === "shipped" ? "Dikirim" :
                                   order.status === "delivered" || order.status === "completed" ? "Selesai" :
                                   order.status === "cancelled" ? "Dibatalkan" : order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
