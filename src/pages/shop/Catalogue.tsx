import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";
import type { Product, Category } from "../../types";

const PRODUCTS_PER_PAGE = 10;

export default function ShopCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (prodRes.data) setProducts(prodRes.data);
      } catch (err) {
        console.error("Error fetching catalogue:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = products
    .filter(p => !selectedCategory || p.category_id === selectedCategory)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => (priceMin === 0 || p.price >= priceMin) && (priceMax === 0 || p.price <= priceMax))
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const resetPage = () => setPage(1);

  const addToCart = (product: Product) => {
    const saved = localStorage.getItem("nexus_cart");
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { id: string }) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 });
    }
    localStorage.setItem("nexus_cart", JSON.stringify(cart));
  };

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-8">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 font-medium">
          <Link className="hover:text-primary transition-colors" to="/">Beranda</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface">Toko</span>
        </nav>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/*  Filter Sidebar  */}
          <aside className="col-span-3 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg tracking-tight">Filter Produk</h2>
                <button
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => { setSelectedCategory(null); setPriceMin(0); setPriceMax(0); resetPage(); }}
                >
                  Hapus Filter
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                  Kategori
                </h3>
                {loading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-5 bg-surface-container-low animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-base pointer-events-none">search</span>
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        placeholder="Cari kategori..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none bg-surface-container-lowest transition-all"
                      />
                    </div>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {categories
                        .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map(cat => (
                          <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all"
                              type="checkbox"
                              checked={selectedCategory === cat.id}
                              onChange={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); resetPage(); }}
                            />
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {cat.name}
                            </span>
                          </label>
                        ))
                      }
                      {categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                        <p className="text-xs text-on-surface-variant py-2 text-center">Tidak ditemukan</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                  Rentang Harga
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-medium">Harga Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={priceMin || ''}
                        onChange={e => setPriceMin(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none bg-surface-container-lowest"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-medium">Harga Maksimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={priceMax || ''}
                        onChange={e => setPriceMax(Number(e.target.value) || 0)}
                        placeholder="Semua harga"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none bg-surface-container-lowest"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => { setPriceMin(0); setPriceMax(0); resetPage(); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Reset Harga
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/*  Product Grid  */}
          <section className="col-span-9">
            <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between mb-8 shadow-sm border border-outline-variant/10">
              <p className="text-sm font-medium text-on-surface-variant">
                {searchQuery ? (
                  <>Hasil pencarian "<span className="text-on-surface font-bold">{searchQuery}</span>": <span className="text-on-surface font-bold">{filtered.length}</span> produk</>
                ) : (
                  <>Menampilkan <span className="text-on-surface font-bold">{filtered.length}</span> produk</>
                )}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-on-surface-variant">Urutkan:</span>
                <select
                  className="bg-surface-container-low border-none rounded-lg text-sm font-semibold px-4 py-2 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                  value={sort}
                  onChange={e => { setSort(e.target.value); resetPage(); }}
                >
                  <option value="newest">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <div className="aspect-square bg-surface-container-low animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-2 bg-surface-container-low animate-pulse rounded w-1/3" />
                      <div className="h-3 bg-surface-container-low animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-surface-container-low animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-container-low rounded-2xl">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">inventory_2</span>
                <p className="text-on-surface-variant font-medium">Belum ada produk tersedia.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-5 gap-4">
                  {paginated.map(product => (
                    <div
                      key={product.id}
                      className="group bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,74,198,0.1)] transition-all duration-500 relative"
                    >
                      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-surface-container-low block">
                        {product.image_url ? (
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.image_url} alt={product.name} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
      )}
                        <button
                          onClick={e => { e.preventDefault(); addToCart(product); }}
                          className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            add_shopping_cart
                          </span>
                        </button>
                      </Link>
                      <div className="p-3 flex flex-col flex-grow">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1 truncate">
                          {product.category?.name || "Produk"}
                        </span>
                        <h3 className="text-xs font-semibold text-on-surface line-clamp-2 leading-tight mb-1.5 min-h-[2rem]">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-0.5 mb-1.5">
        {(product as any).reviews && (product as any).reviews.length > 0 ? (
          <>
            <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[10px] text-on-surface-variant ml-1">{((product as any).reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / (product as any).reviews.length).toFixed(1)}</span>
          </>
        ) : (
          <span className="text-[10px] font-bold text-outline">Belum ada rating</span>
        )}
      </div>
                        <div className="mt-auto">
                          <p className="text-sm font-black text-primary tracking-tighter">
                            Rp {Number(product.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/10">
                    <p className="text-sm text-on-surface-variant">
                      Halaman <span className="font-bold text-on-surface">{page}</span> dari <span className="font-bold text-on-surface">{totalPages}</span> — {filtered.length} produk
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                        Sebelumnya
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                          .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) =>
                            p === '...' ? (
                              <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-on-surface-variant text-sm">…</span>
                            ) : (
                              <button
                                key={p}
                                onClick={() => setPage(p as number)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                                  p === page
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
                                }`}
                              >
                                {p}
                              </button>
                            )
                          )
                        }
                      </div>

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Selanjutnya
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
