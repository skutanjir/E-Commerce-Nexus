import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

import type { Product, Category } from "../../types";

export default function Home() {
  const { user, profile: userProfile } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Run fetch in parallel
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);

        if (catRes.data) {
          setCategories(catRes.data.slice(0, 6)); // Limit 6
        }

        if (prodRes.data) {
          // Sort by newest and limit to 4
          const sorted = prodRes.data.sort((a: Product, b: Product) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 4);
          setFeaturedProducts(sorted);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const dashboardLink = userProfile?.role === "seller" ? "/admin-dashboard-overview" : "/user-dashboard";

  const getCategoryIcon = (name: string) => {
    const LowerName = name.toLowerCase();
    if (LowerName.includes("electronics") || LowerName.includes("elektronik")) return "devices";
    if (LowerName.includes("fashion")) return "apparel";
    if (LowerName.includes("home") || LowerName.includes("rumah")) return "chair";
    if (LowerName.includes("beauty") || LowerName.includes("kecantikan")) return "dermatology";
    if (LowerName.includes("sport") || LowerName.includes("olahraga")) return "fitness_center";
    return "grid_view";
  };

  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/*  Hero Section  */}
        <section className="relative overflow-hidden px-8 py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase rounded-full">
                Koleksi Terbaru 2024
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
                Belanja Cerdas, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  Hidup Berkualitas
                </span>
              </h1>
              <p className="text-on-surface-variant text-lg lg:text-xl max-w-lg leading-relaxed">
                Temukan kurasi produk gaya hidup terbaik dari seluruh dunia
                dengan harga yang kompetitif dan kualitas yang terjamin.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/categories" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all">
                  Belanja Sekarang
                </Link>
                {user ? (
                  <Link
                    to={dashboardLink}
                    className="px-8 py-4 bg-surface-container-lowest text-primary font-bold rounded-lg border border-primary/10 hover:bg-surface-container-low transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    Dashboard Saya
                  </Link>
                ) : (
                  <Link to="/login-page" className="px-8 py-4 bg-surface-container-lowest text-primary font-bold rounded-lg border border-primary/10 hover:bg-surface-container-low transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">login</span>
                    Masuk atau Daftar
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIFPEwWWLYG0Dj9QquIVmOa5qTQRsUAbmoF_WL3thhpojRp05XQw1WZy0e0hY0ZXbDkVEnUZAHpVW1nCK9BMst4V0w-z4LzOE7s2GGWYaqWZ9IrKTk-D--_9MBPqTSCLPzhahcbbPlAQcHmRJdOWwmrq2WcyYi64oEujuaaoWrQk79BTXy0xzOjmIRJMs_QbphknAdhc81YbRCR4s3kh38riG3V2LHaK8-U0F3szQK9uprvraX1GIoTtRaQUS_6nQcPhUp-pfvp9k"
                  alt="Nexus Promo"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary-container">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Produk Trending
                  </p>
                  <p className="font-bold text-on-surface">
                    Real-time Data Terintegrasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  Category Strip  */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Kategori Populer
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Jelajahi berbagai koleksi terbaik kami dari database
                </p>
              </div>
              <Link
                to="/categories"
                className="group flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Lihat Semua
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-40 bg-surface-container-low animate-pulse rounded-3xl"></div>
                ))
              ) : categories.map((cat) => (
                <Link key={cat.id} to={`/categories/${cat.slug}`} className="group relative cursor-pointer">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-blue-600/30 group-hover:shadow-xl group-hover:shadow-blue-600/5 transition-all duration-500 text-center flex flex-col items-center gap-4 overflow-hidden h-full">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                      <span className="material-symbols-outlined text-3xl">
                        {getCategoryIcon(cat.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {cat.name}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/*  Featured Products Grid  */}
        <section className="py-20 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4 tracking-tight">
                Pilihan Terbaik
              </h2>
              <p className="text-on-surface-variant">
                Produk terbaru yang baru saja ditambahkan ke koleksi kami.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-surface-container-lowest animate-pulse rounded-2xl"></div>
                ))
              ) : featuredProducts.map((product) => (
                <div key={product.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                      alt={product.name}
                    />
                    <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-on-surface">5.0</span>
                      <span className="text-[10px] text-on-surface-variant ml-2 uppercase tracking-widest">{product.category?.name}</span>
                    </div>
                    <h3 className="font-bold text-on-surface mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-primary font-black text-xl mb-4">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full py-3 bg-surface-container border border-primary/10 text-primary text-center font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-sm uppercase tracking-wider"
                    >
                      Lihat Produk
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  Promo Banner  */}
        <section className="py-12 px-8">
          <div className="max-w-7xl mx-auto h-[400px] rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary-container mix-blend-multiply opacity-90"></div>
            <img
              className="absolute inset-0 w-full h-full object-cover -z-10 group-hover:scale-105 transition-transform duration-1000"
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=60"
              alt="Promo Banner"
            />
            <div className="relative h-full flex flex-col items-center justify-center text-center p-12 text-white">
              <h2 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                MEGA SALE 11.11
              </h2>
              <p className="text-xl lg:text-2xl mb-8 font-medium max-w-2xl opacity-90">
                Dapatkan diskon hingga 90% untuk seluruh koleksi. Hanya tersedia
                selama persediaan masih ada.
              </p>
              <button className="bg-white text-primary px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-white/20">
                Ambil Voucher Sekarang
              </button>
            </div>
          </div>
        </section>

        {/*  Trust Badges  */}
        <section className="py-16 px-8 border-y border-surface-container">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">local_shipping</span>
              </div>
              <h4 className="text-xl font-bold">Gratis Ongkir</h4>
              <p className="text-on-surface-variant text-sm px-4">Pengiriman tanpa biaya ke seluruh wilayah Indonesia tanpa minimum belanja.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">verified_user</span>
              </div>
              <h4 className="text-xl font-bold">Pembayaran Aman</h4>
              <p className="text-on-surface-variant text-sm px-4">Berbagai metode pembayaran terenkripsi dan terjamin keamanannya.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">support_agent</span>
              </div>
              <h4 className="text-xl font-bold">Dukungan 24/7</h4>
              <p className="text-on-surface-variant text-sm px-4">Tim customer service kami siap membantu Anda kapan saja, setiap hari.</p>
            </div>
          </div>
        </section>

        {/*  Testimonials  */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto text-center mb-16">
             <h2 className="text-4xl font-black mb-4 tracking-tight">Apa Kata Mereka?</h2>
             <p className="text-on-surface-variant">Kepuasan pelanggan adalah prioritas utama kami.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
             <div className="bg-surface-container p-8 rounded-3xl italic">
                "Kualitas produknya benar-benar premium sesuai deskripsi. NEXUS memberikan standar baru belanja online."
                <p className="mt-4 font-bold not-italic text-primary">— Aditya Pratama</p>
             </div>
             <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 italic border border-primary/10">
                "Pengalaman belanja yang mulus dan pengiriman sangat cepat. Sangat merekomendasikan NEXUS!"
                <p className="mt-4 font-bold not-italic text-primary">— Siti Rahmawati</p>
             </div>
             <div className="bg-surface-container p-8 rounded-3xl italic">
                "Packing rapi dan aman. Customer service sangat responsif membantu kendala pengiriman."
                <p className="mt-4 font-bold not-italic text-primary">— Budi Santoso</p>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
