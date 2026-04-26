export default function AdminDashboardFixedLayout() {
  return (
    <>
      {/*  Sidebar Navigation  */}
      <aside className="w-72 bg-surface-container-lowest fixed h-full flex flex-col border-r border-outline-variant z-30">
        <div className="px-8 py-10">
          <span className="text-2xl font-black tracking-tighter text-primary">
            NEXUS
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {/*  Active Item  */}
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 text-primary font-semibold transition-all"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <span className="text-sm">Overview</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm">Produk</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">category</span>
            <span className="text-sm">Kategori</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-sm">Pesanan</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm">Laporan</span>
          </a>
        </nav>
        <div className="p-6">
          <div className="bg-surface-variant/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              JD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-on-surface truncate">
                John Doe
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Seller
              </p>
            </div>
          </div>
        </div>
      </aside>
      {/*  Main Content Canvas  */}
      <main className="flex-1 ml-72 p-10">
        {/*  Header  */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              Dashboard Overview
            </h1>
            <p className="text-on-surface-variant text-base mt-1">
              Welcome back, here's what's happening with your store today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant border border-outline-variant flex items-center gap-2 hover:bg-surface-variant/30 transition-all">
              <span className="material-symbols-outlined text-[20px]">
                calendar_today
              </span>
              Last 30 Days
            </button>
            <button className="bg-primary px-6 py-2.5 rounded-xl text-sm font-bold text-on-primary flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
              Export Data
            </button>
          </div>
        </header>
        {/*  Stats Bento Grid  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/*  Card 1  */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant group transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Total Revenue
            </p>
            <h3 className="text-2xl font-black text-on-surface mt-2">
              Rp 1.254.000.000
            </h3>
          </div>
          {/*  Card 2  */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant group transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 rounded-xl bg-secondary-container/10 text-secondary-container group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">shopping_bag</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +8.2%
              </span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Total Orders
            </p>
            <h3 className="text-2xl font-black text-on-surface mt-2">45,821</h3>
          </div>
          {/*  Card 3  */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant group transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 rounded-xl bg-tertiary-container/10 text-tertiary-container group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">inventory</span>
              </div>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-variant/50 px-2.5 py-1 rounded-full">
                Static
              </span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Active Products
            </p>
            <h3 className="text-2xl font-black text-on-surface mt-2">1,204</h3>
          </div>
          {/*  Card 4  */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline-variant group transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                -2.4%
              </span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Total Users
            </p>
            <h3 className="text-2xl font-black text-on-surface mt-2">
              128,402
            </h3>
          </div>
        </div>
        {/*  Charts Section  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 items-stretch">
          {/*  Line Chart Mockup  */}
          <div className="bg-surface p-8 rounded-2xl shadow-sm border border-outline-variant flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-on-surface">
                Pendapatan 12 Bulan Terakhir
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs text-on-surface-variant font-bold">
                  Revenue
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="relative h-64 w-full flex items-end justify-between px-2 pt-4 overflow-hidden">
                <div className="absolute inset-0 grid grid-rows-4 w-full">
                  <div className="border-t border-outline-variant/30"></div>
                  <div className="border-t border-outline-variant/30"></div>
                  <div className="border-t border-outline-variant/30"></div>
                  <div className="border-t border-outline-variant/30"></div>
                </div>
                <svg
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M0,80 Q10,75 20,40 T40,50 T60,20 T80,35 T100,10"
                    fill="none"
                    stroke="#004ac6"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M0,80 Q10,75 20,40 T40,50 T60,20 T80,35 T100,10 L100,100 L0,100 Z"
                    fill="url(#grad1)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient
                      id="grad1"
                      x1="0%"
                      x2="0%"
                      y1="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#004ac6", stopOpacity: "1" }}
                      ></stop>
                      <stop
                        offset="100%"
                        style={{ stopColor: "#004ac6", stopOpacity: "0" }}
                      ></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute left-[60%] top-[15%] flex flex-col items-center">
                  <div className="bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded font-bold shadow-lg mb-1">
                    Rp 128M
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-surface"></div>
                </div>
              </div>
              <div className="flex justify-between mt-6 px-2">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Jan
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Mar
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  May
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Jul
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Sep
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Nov
                </span>
              </div>
            </div>
          </div>
          {/*  Bar Chart Mockup  */}
          <div className="bg-surface p-8 rounded-2xl shadow-sm border border-outline-variant flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-on-surface">
                Penjualan per Kategori
              </h2>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                more_vert
              </span>
            </div>
            <div className="flex-1 flex items-end gap-6 w-full px-4">
              <div className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-secondary-container/10 rounded-t-lg transition-all relative h-56">
                  <div
                    className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg"
                    style={{ height: "60%" }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Fashion
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-secondary-container/10 rounded-t-lg transition-all relative h-56">
                  <div
                    className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg"
                    style={{ height: "85%" }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Electro
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-secondary-container/10 rounded-t-lg transition-all relative h-56">
                  <div
                    className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg"
                    style={{ height: "45%" }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Home
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-secondary-container/10 rounded-t-lg transition-all relative h-56">
                  <div
                    className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg"
                    style={{ height: "95%" }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Beauty
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-secondary-container/10 rounded-t-lg transition-all relative h-56">
                  <div
                    className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg"
                    style={{ height: "30%" }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  Toys
                </span>
              </div>
            </div>
          </div>
        </div>
        {/*  Table Section  */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center bg-surface-variant/20 border-b border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface">
              Pesanan Terbaru
            </h2>
            <button className="text-primary text-sm font-bold hover:underline">
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest border-b border-outline-variant">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Produk</th>
                  <th className="px-8 py-5">Harga</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <tr className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold">#ORD-9421</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-surface-variant flex items-center justify-center font-bold text-xs">
                        BS
                      </div>
                      <span className="text-sm font-semibold">
                        Budi Santoso
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    MacBook Pro M2...
                  </td>
                  <td className="px-8 py-5 text-sm font-black">
                    Rp 24.500.000
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                      Completed
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold">#ORD-9420</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-surface-variant flex items-center justify-center font-bold text-xs">
                        SA
                      </div>
                      <span className="text-sm font-semibold">Siti Aminah</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    Sony WH-1000XM5
                  </td>
                  <td className="px-8 py-5 text-sm font-black">Rp 5.200.000</td>
                  <td className="px-8 py-5">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-wide">
                      Processing
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold">#ORD-9419</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-surface-variant flex items-center justify-center font-bold text-xs">
                        AW
                      </div>
                      <span className="text-sm font-semibold">Andi Wijaya</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    Logitech MX Master 3
                  </td>
                  <td className="px-8 py-5 text-sm font-black">Rp 1.450.000</td>
                  <td className="px-8 py-5">
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-wide">
                      Pending
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold">#ORD-9418</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-surface-variant flex items-center justify-center font-bold text-xs">
                        RM
                      </div>
                      <span className="text-sm font-semibold">Rina Melati</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">
                    Dyson V15 Detect
                  </td>
                  <td className="px-8 py-5 text-sm font-black">
                    Rp 12.800.000
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                      Completed
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {/*  Floating Action Button  */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="h-14 w-14 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </>
  );
}
