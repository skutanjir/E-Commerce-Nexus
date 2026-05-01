import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";

import type { Category, CategoryWithCount } from "../../types";

const CATS_PER_PAGE = 12;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories");
        const data = response.data;

        setCategories(data as CategoryWithCount[]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 font-label">
          <Link className="hover:text-primary transition-colors" to="/">
            Beranda
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-on-surface font-medium">Kategori</span>
        </nav>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-lg">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari kategori..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 bg-error/10 text-error rounded-xl text-center">
            {error}
          </div>
        ) : (() => {
          const filtered = search.trim()
            ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
            : categories;
          const totalPages = Math.ceil(filtered.length / CATS_PER_PAGE);
          const paginated = filtered.slice((page - 1) * CATS_PER_PAGE, page * CATS_PER_PAGE);
          return (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-on-surface-variant font-medium">
                  {search.trim() ? (
                    <>Hasil pencarian "<span className="font-bold text-on-surface">{search}</span>": <span className="font-bold text-on-surface">{filtered.length}</span> kategori</>
                  ) : (
                    <>Menampilkan <span className="font-bold text-on-surface">{filtered.length > 0 ? (page - 1) * CATS_PER_PAGE + 1 : 0}–{Math.min(page * CATS_PER_PAGE, filtered.length)}</span> dari <span className="font-bold text-on-surface">{filtered.length}</span> kategori</>
                  )}
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-on-surface-variant">Halaman {page} / {totalPages}</p>
                )}
              </div>

              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
                  <p className="text-on-surface font-bold mb-1">Kategori tidak ditemukan</p>
                  <p className="text-sm text-on-surface-variant mb-4">Coba kata kunci lain</p>
                  <button onClick={() => { setSearch(""); setPage(1); }} className="text-primary font-bold text-sm hover:underline">
                    Hapus pencarian
                  </button>
                </div>
              ) : (
                <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {paginated.map((category) => (
                    <Link
                      key={category.id}
                      className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-lowest editorial-shadow transition-all duration-300 hover:-translate-y-1"
                      to={`/categories/${category.slug}`}
                    >
                      <img
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={category.name}
                        src={category.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <span className="text-xs uppercase tracking-widest text-primary-fixed mb-1 block font-bold">
                          {category.product_count} Produk
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </section>
              )}

              {paginated.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Sebelumnya
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          p === page
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Selanjutnya
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          );
        })()}

        <section className="mt-20 p-12 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-2">
              Tidak menemukan kategori yang dicari?
            </h2>
            <p className="text-on-surface-variant">
              Layanan kami dapat membantu Anda menemukan produk dari kategori
              yang belum tersedia atau memberikan rekomendasi personal
              sesuai kebutuhan Anda.
            </p>
          </div>
          <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg active:scale-95 transition-all editorial-shadow">
            Hubungi Kami
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
