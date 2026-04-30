import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";

import type { Product, Category } from "../../types";

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setLoading(true);
        // We'll fetch all categories and filter by slug since our current API
        // may not have a get category by slug endpoint. Alternatively, fetch all and filter.
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);

        const targetCat = catRes.data?.find((c: Category) => c.slug === slug);

        if (!targetCat) {
          throw new Error("Category not found");
        }

        setCategory(targetCat);

        // Filter products that belong to this category
        const catProducts = prodRes.data?.filter((p: Product) => p.category_id === targetCat.id) || [];
        setProducts(catProducts);

      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

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
          <Link className="hover:text-primary transition-colors" to="/categories">
            Kategori
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-on-surface font-medium capitalize">{category?.name || slug}</span>
        </nav>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 bg-error/10 text-error rounded-xl text-center">
            Kategori tidak ditemukan atau gagal dimuat.
          </div>
        ) : (
          <div>
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4 capitalize">{category?.name}</h1>
              <p className="text-on-surface-variant max-w-2xl">
                {category?.description || `Jelajahi koleksi ${category?.name} berkualitas tinggi kami.`}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="p-20 text-center bg-surface-container-low rounded-2xl">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">
                  inventory_2
                </span>
                <p className="text-on-surface-variant">Belum ada produk di kategori ini.</p>
              </div>
            ) : (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-surface-container-low">
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-primary font-black text-xl">
                        Rp {Number(product.price).toLocaleString()}
                      </p>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          const saved = localStorage.getItem("nexus_cart");
                          const cart = saved ? JSON.parse(saved) : [];
                          const existing = cart.find((i: { id: string }) => i.id === product.id);
                          if (existing) { existing.quantity += 1; } else {
                            cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 });
                          }
                          localStorage.setItem("nexus_cart", JSON.stringify(cart));
                          window.dispatchEvent(new Event("nexus:cart-updated"));
                        }}
                        className="w-full mt-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </Link>
                ))}
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
