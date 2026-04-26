import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { supabase } from "../../lib/supabase";
import type { Product, Category } from "../../types";

export default function ShopCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [{ data: catData }, { data: prodData }] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("products").select("*, category:categories(name, slug)").order("created_at", { ascending: false }),
        ]);
        if (catData) setCategories(catData);
        if (prodData) setProducts(prodData as Product[]);
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
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-8">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 font-medium">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface">Shop</span>
        </nav>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/*  Filter Sidebar  */}
          <aside className="col-span-3 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg tracking-tight">Filters</h2>
                <button
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => setSelectedCategory(null)}
                >
                  Hapus Filter
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                  Category
                </h3>
                {loading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-5 bg-surface-container-low animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all"
                          type="checkbox"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        />
                        <span className="text-sm group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <input
                    className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                    max="10000000"
                    min="0"
                    step="100000"
                    type="range"
                  />
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
                    <span>Rp0</span>
                    <span>Rp10jt</span>
                  </div>
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
                <span className="text-sm font-semibold text-on-surface-variant">Sort by:</span>
                <select
                  className="bg-surface-container-low border-none rounded-lg text-sm font-semibold px-4 py-2 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  <option value="newest">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <div className="aspect-square bg-surface-container-low animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-surface-container-low animate-pulse rounded w-1/3" />
                      <div className="h-4 bg-surface-container-low animate-pulse rounded w-3/4" />
                      <div className="h-5 bg-surface-container-low animate-pulse rounded w-1/2" />
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
              <div className="grid grid-cols-3 gap-6">
                {filtered.map(product => (
                  <div
                    key={product.id}
                    className="group bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,74,198,0.1)] transition-all duration-500 relative"
                  >
                    <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-surface-container-low block">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                        alt={product.name}
                      />
                      <button
                        onClick={e => { e.preventDefault(); addToCart(product); }}
                        className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          add_shopping_cart
                        </span>
                      </button>
                    </Link>
                    <div className="p-4 flex flex-col flex-grow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                        {product.category?.name || "Produk"}
                      </span>
                      <h3 className="text-sm font-semibold text-on-surface line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        <p className="text-lg font-black text-primary tracking-tighter">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
