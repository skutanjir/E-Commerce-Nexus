import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import type { Profile, Order } from "../../types";

interface AdminStat {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  color: string;
}

export default function AdminDashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function getAdminData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login-page");
          return;
        }

        // Fetch Current Admin Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile?.role !== 'seller') {
          navigate("/user-dashboard");
          return;
        }
        setAdminProfile(profile as Profile);

        // Fetch Stats
        // 1. Total Revenue
        const { data: revData } = await supabase
          .from("orders")
          .select("total_amount")
          .neq("status", "cancelled");
        const totalRevenue = revData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

        // 2. Total Orders
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: 'exact', head: true });

        // 3. Active Products
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true });

        // 4. Total Users
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("role", "user");

        setStats([
          { label: "Total Revenue", value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: "payments", color: "primary" },
          { label: "Total Orders", value: orderCount || 0, icon: "shopping_bag", color: "secondary" },
          { label: "Active Products", value: productCount || 0, icon: "inventory", color: "tertiary" },
          { label: "Total Users", value: userCount || 0, icon: "group", color: "blue" },
        ]);

        // Fetch Recent Orders
        const { data: orders } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            total_amount,
            status,
            profile:profiles (full_name)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentOrders(orders as unknown as Order[] || []);

      } catch (err) {
        console.error("Error loading admin dashboard:", (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    getAdminData();
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
    <div className="flex min-h-screen">
      {/*  Sidebar Navigation  */}
      <aside className="w-72 bg-surface-container-lowest fixed h-full flex flex-col border-r border-outline-variant/10 z-30">
        <div className="px-8 py-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary">
            NEXUS
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1 text-on-surface-variant">
          <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 text-primary font-semibold transition-all" to="/admin-dashboard-overview">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-sm">Overview</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low hover:text-primary transition-all" to="/admin-product-management">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm">Produk</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low hover:text-primary transition-all" to="/admin-category-management">
            <span className="material-symbols-outlined">category</span>
            <span className="text-sm">Kategori</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low hover:text-primary transition-all" to="/admin-order-management">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-sm">Pesanan</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low hover:text-primary transition-all" to="/admin-discounts">
            <span className="material-symbols-outlined">local_offer</span>
            <span className="text-sm">Diskon & Promo</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low hover:text-primary transition-all" to="/admin-reports-analytics">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm">Laporan</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full mb-4 px-4 py-2 text-sm font-bold text-error border border-error/20 rounded-lg hover:bg-error/5 transition-all">
            Logout
          </button>
          <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
              {adminProfile?.avatar_url ? (
                <img src={adminProfile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                adminProfile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'AD'
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface truncate max-w-[120px]">
                {adminProfile?.full_name || 'Admin'}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                Seller
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/*  Main Content Canvas  */}
      <main className="flex-1 ml-72 bg-mesh p-8 bg-surface-container-lowest">
        {/*  Header  */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              Dashboard Overview
            </h1>
            <p className="text-on-surface-variant body-md mt-1">
              Welcome back, {adminProfile?.full_name?.split(' ')[0]}. Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-container-lowest px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant flex items-center gap-2 hover:bg-surface-container-highest transition-all shadow-sm">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              Last 30 Days
            </button>
            <button className="bg-primary px-5 py-2.5 rounded-lg text-sm font-bold text-on-primary flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export Data
            </button>
          </div>
        </header>

        {/*  Stats Bento Grid  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color === 'primary' ? 'primary' : 'secondary-container'}/10 text-${stat.color === 'primary' ? 'primary' : 'on-secondary-container'} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                {stat.change && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-on-surface mt-1 truncate">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/*  Charts Section (Mock visual remains)  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/*  Line Chart  */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="headline-sm font-bold text-on-surface">Pendapatan Terbaru</h2>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
            <div className="h-64 bg-surface-container-low/30 rounded-xl relative overflow-hidden flex items-end">
               <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 Q10,75 20,40 T40,50 T60,20 T80,35 T100,10" fill="none" stroke="#004ac6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
               </svg>
            </div>
          </div>
          {/*  Category Bar Chart  */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h2 className="headline-sm font-bold text-on-surface mb-8">Populer per Kategori</h2>
            <div className="h-64 flex items-end gap-3">
              {[60, 85, 45, 90, 35].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/*  Table Section  */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center bg-surface-container-low/50">
            <h2 className="headline-sm font-bold text-on-surface">Recent Orders</h2>
            <Link className="text-primary text-sm font-bold hover:underline" to="/admin-order-management">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant/10">
                  <th className="px-8 py-4">Order ID</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No orders found.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-4 text-sm font-bold uppercase font-mono text-primary">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-8 py-4 text-sm">
                        {order.profile?.full_name || 'Guest'}
                      </td>
                      <td className="px-8 py-4 text-sm font-bold">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                          visibility
                        </span>
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
