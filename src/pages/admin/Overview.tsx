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
          { label: "Total Pendapatan", value: `Rp ${Number(data.revenue || 0).toLocaleString("id-ID")}`, icon: "payments", color: "text-primary", bg: "bg-primary/5" },
          { label: "Total Pesanan", value: data.orderCount || 0, icon: "shopping_bag", color: "text-secondary", bg: "bg-secondary/5" },
          { label: "Total Produk", value: data.productCount || 0, icon: "inventory", color: "text-tertiary", bg: "bg-tertiary/5" },
          { label: "Total Pembeli", value: data.customerCount || 0, icon: "group", color: "text-blue-600", bg: "bg-blue-50" },
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
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Dashboard Overview</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Selamat datang, {adminProfile?.full_name?.split(" ")[0]}. Berikut ringkasan toko Anda hari ini.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10 animate-pulse">
                <div className="w-12 h-12 bg-outline-variant/10 rounded-lg mb-4" />
                <div className="h-3 w-20 bg-outline-variant/10 rounded mb-2" />
                <div className="h-6 w-32 bg-outline-variant/10 rounded" />
              </div>
            ))
          : stats.map((stat, idx) => (
              <div key={idx} className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10 hover:-translate-y-1 transition-all group">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mb-4 w-fit group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-on-surface mt-1 truncate">{stat.value}</h3>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { to: "/admin-product-management", label: "Kelola Produk", sub: "Tambah & edit produk", icon: "inventory_2", color: "text-primary", bg: "bg-primary/5", hover: "group-hover:bg-primary" },
          { to: "/admin-order-management", label: "Kelola Pesanan", sub: "Update status pesanan", icon: "shopping_cart", color: "text-secondary", bg: "bg-secondary/5", hover: "group-hover:bg-secondary" },
          { to: "/admin-reports-analytics", label: "Lihat Laporan", sub: "Analitik & pendapatan", icon: "analytics", color: "text-tertiary", bg: "bg-tertiary/5", hover: "group-hover:bg-tertiary" },
        ].map(item => (
          <Link key={item.to} to={item.to} className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant/10 hover:border-primary/20 hover:shadow-md transition-all flex items-center gap-4 group">
            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} ${item.hover} group-hover:text-white transition-all`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">{item.label}</p>
              <p className="text-xs text-on-surface-variant">{item.sub}</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
          </Link>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-5 flex justify-between items-center border-b border-outline-variant/10">
          <h2 className="font-bold text-on-surface">Pesanan Terbaru</h2>
          <Link className="text-primary text-sm font-bold hover:underline" to="/admin-order-management">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant/10">
                <th className="px-8 py-4">ID Pesanan</th>
                <th className="px-8 py-4">Pelanggan</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Tanggal</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? Array(5).fill(0).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="px-8 py-4"><div className="h-4 w-24 bg-outline-variant/10 rounded" /></td>
                  ))}
                </tr>
              )) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Belum ada pesanan.</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-8 py-4 text-sm font-bold font-mono text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-8 py-4 text-sm text-on-surface">{order.profile?.full_name || "Guest"}</td>
                  <td className="px-8 py-4 text-sm font-bold">Rp {Number(order.total_amount).toLocaleString("id-ID")}</td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">
                    {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                      order.status === "delivered" || order.status === "completed" ? "bg-green-100 text-green-700"
                      : order.status === "pending" ? "bg-orange-100 text-orange-700"
                      : order.status === "cancelled" ? "bg-slate-100 text-slate-700"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                      {order.status === "pending" ? "Menunggu" : order.status === "shipped" ? "Dikirim"
                        : order.status === "delivered" || order.status === "completed" ? "Selesai"
                        : order.status === "cancelled" ? "Dibatalkan" : order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
