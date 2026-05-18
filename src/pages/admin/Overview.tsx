import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAdmin } from "../../contexts/AdminContext";
import type { Order } from "../../types";

interface AdminStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
}

export default function AdminDashboardOverview() {
  const { adminProfile } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/orders/admin/stats');

        setStats([
          { label: "Total Pendapatan", value: `Rp ${Number(data.revenue || 0).toLocaleString("id-ID")}`, icon: "payments", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Pesanan", value: data.orderCount || 0, icon: "shopping_bag", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Produk", value: data.productCount || 0, icon: "inventory", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Pembeli", value: data.customerCount || 0, icon: "group", color: "text-indigo-600", bg: "bg-indigo-50" },
        ]);

        setRecentOrders(data.recentOrders || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Selamat datang kembali, <span className="text-primary font-bold">{adminProfile?.full_name?.split(" ")[0]}</span>. Mari pantau perkembangan toko Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Hari Ini
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Unduh Laporan
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {loading
          ? Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6" />
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded mb-3" />
                <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ))
          : stats.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700 group-hover:rotate-12 group-hover:opacity-10">
                   <span className={`material-symbols-outlined text-8xl ${stat.color}`}>{stat.icon}</span>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-8 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Pesanan Terbaru</h2>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">Transaksi terakhir dari toko Anda</p>
            </div>
            <Link className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-primary text-xs font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all" to="/admin-order-management">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800">
                  <th className="px-8 py-5">ID Pesanan</th>
                  <th className="px-8 py-5">Pelanggan</th>
                  <th className="px-8 py-5">Total</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? Array(5).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-8 py-5"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" /></td>
                  </tr>
                )) : recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">Belum ada transaksi terekam.</td></tr>
                ) : recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold font-mono text-slate-400 group-hover:text-primary transition-colors">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {order.profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'GS'}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.profile?.full_name || "Guest User"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === "delivered" || order.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : order.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : order.status === "cancelled" ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          order.status === "delivered" || order.status === "completed" ? "bg-emerald-500"
                          : order.status === "pending" ? "bg-amber-500"
                          : order.status === "cancelled" ? "bg-rose-500"
                          : "bg-blue-500"
                        }`} />
                        {order.status === "pending" ? "Menunggu" : order.status === "shipped" ? "Dikirim"
                          : order.status === "delivered" || order.status === "completed" ? "Selesai"
                          : order.status === "cancelled" ? "Dibatalkan" : order.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Aksi Cepat</h3>
             <div className="grid grid-cols-1 gap-3">
                {[
                  { to: "/admin-product-management", label: "Produk", icon: "inventory_2", color: "text-blue-600", bg: "bg-blue-50" },
                  { to: "/admin-order-management", label: "Pesanan", icon: "shopping_cart", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { to: "/admin-reports-analytics", label: "Laporan", icon: "analytics", color: "text-amber-600", bg: "bg-amber-50" },
                  { to: "/admin-dashboard-chat", label: "Pesan", icon: "chat", color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((item, idx) => (
                  <Link key={idx} to={item.to} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-primary transition-colors text-[20px]">arrow_forward_ios</span>
                  </Link>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-700 p-8 rounded-[32px] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <span className="material-symbols-outlined text-[160px]">stars</span>
            </div>
            <h3 className="text-xl font-black mb-2">Upgrade Toko</h3>
            <p className="text-blue-100 text-xs font-medium leading-relaxed mb-6">Nikmati fitur analitik lanjutan dan batas produk yang lebih besar dengan akun Pro.</p>
            <button className="w-full py-3 bg-white text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
