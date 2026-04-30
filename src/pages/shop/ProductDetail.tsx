import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

import type { Product } from "../../types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // The REST API /products/:id will return the product with category and reviews injected
        const res = await api.get(`/products/${id}`);
        const productData = res.data;
        setProduct(productData);

        if (productData.reviews && productData.reviews.length > 0) {
          const avg = productData.reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / productData.reviews.length;
          setAvgRating(Math.round(avg * 10) / 10);
          setReviewCount(productData.reviews.length);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err.message);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!currentUser) {
      navigate("/login-page");
      return;
    }
    const saved = localStorage.getItem("nexus_cart");
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { id: string }) => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity });
    }
    localStorage.setItem("nexus_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("nexus:cart-updated"));
    setAddedMsg(`${quantity} item ditambahkan ke keranjang!`);
    setTimeout(() => setAddedMsg(null), 3000);
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      navigate("/login-page");
      return;
    }
    if (!product) return;
    const saved = localStorage.getItem("nexus_cart");
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { id: string }) => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity });
    }
    localStorage.setItem("nexus_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("nexus:cart-updated"));
    navigate("/checkout-flow");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center p-8">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-on-surface-variant mb-6 text-center max-w-md">
            Produk yang Anda cari tidak ada atau gagal dimuat.
          </p>
          <Link to="/" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold">
            Kembali ke Beranda
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 lg:px-8">
        {/*  Breadcrumb  */}
        <nav className="flex mb-12 text-sm font-medium text-on-surface-variant font-label">
          <Link className="hover:text-primary transition-colors" to="/">Beranda</Link>
          <span className="mx-2 opacity-30">/</span>
          <Link className="hover:text-primary transition-colors" to="/categories">Toko</Link>
          <span className="mx-2 opacity-30">/</span>
          <Link className="hover:text-primary transition-colors capitalize" to={`/categories/${product.category?.slug || 'all'}`}>
            {product.category?.name || 'Kategori'}
          </Link>
          <span className="mx-2 opacity-30">/</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>

        {/*  Product Hero Section  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/*  Gallery Column  */}
          <div className="space-y-6 sticky top-32">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-low shadow-sm border border-outline-variant/10">
              <img
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square rounded-xl border-2 border-primary overflow-hidden cursor-pointer">
                <img src={product.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/*  Product Info Column  */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black tracking-widest rounded-full uppercase">
                {product.category?.name}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => {
                  const filled = avgRating >= s;
                  const half = !filled && avgRating >= s - 0.5;
                  return (
                    <span
                      key={s}
                      className="material-symbols-outlined text-xl text-amber-400"
                      style={{ fontVariationSettings: `'FILL' ${filled || half ? 1 : 0}` }}
                    >
                      {half ? "star_half" : "star"}
                    </span>
                  );
                })}
                <span className="ml-2 text-sm font-black text-on-surface">
                  {reviewCount > 0 ? avgRating.toFixed(1) : "Belum ada rating"}
                </span>
              </div>
              {reviewCount > 0 && (
                <span className="text-on-surface-variant text-sm font-medium">{reviewCount} Ulasan</span>
              )}
            </div>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-5xl font-black text-primary">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm mb-10 space-y-8">
               {/*  Quantity Selector  */}
              <div>
                <h3 className="text-xs font-black text-on-surface-variant mb-4 uppercase tracking-widest">
                  Jumlah Pesanan
                </h3>
                <div className="flex items-center w-fit border border-outline-variant/20 rounded-xl bg-surface-container-low overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-4 text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="px-8 font-black text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-4 text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>

              {/*  CTAs  */}
              {!currentUser && (
                <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-5 py-3 rounded-xl border border-amber-200 text-sm font-bold mb-2">
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Silakan <Link to="/login-page" className="underline ml-1">masuk</Link> terlebih dahulu untuk membeli produk.
                </div>
              )}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-primary text-on-primary py-5 rounded-xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">bolt</span>
                  Beli Sekarang
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full border-2 border-primary text-primary py-5 rounded-xl font-black text-lg hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Tambah ke Keranjang
                </button>
              </div>
            </div>

            {/*  Add to Cart Toast  */}
            {addedMsg && (
              <div className="flex items-center gap-3 bg-primary/10 text-primary px-5 py-3 rounded-xl border border-primary/20 text-sm font-bold mb-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {addedMsg}
              </div>
            )}

            {/*  Description Preview  */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Deskripsi</h3>
              <p className="text-on-surface-variant leading-relaxed text-lg italic">
                "{product.description || 'Belum ada deskripsi untuk produk ini.'}"
              </p>
            </div>
          </div>
        </div>

        {/*  Full Details Section  */}
        <div className="mt-32">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="flex bg-surface-container-low/50">
              <button className="px-12 py-6 text-primary border-b-4 border-primary font-black text-xs tracking-widest uppercase bg-surface-container-lowest">
                Informasi Produk
              </button>
            </div>
            <div className="p-12 lg:p-20">
              <div className="max-w-4xl space-y-8">
                <h2 className="text-3xl font-black text-on-surface">Spesifikasi & Keunggulan Produk</h2>
                <p className="text-on-surface-variant leading-relaxed text-xl">
                  {product.description || 'Produk NEXUS premium ini dirancang dengan standar kualitas tertinggi, memadukan teknologi dan desain secara sempurna.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-start gap-4 p-6 bg-surface-container-low rounded-2xl">
                    <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                    <div>
                      <p className="font-bold text-on-surface">Keaslian Terjamin</p>
                      <p className="text-sm text-on-surface-variant">100% Produk NEXUS Original</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 bg-surface-container-low rounded-2xl">
                    <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                    <div>
                      <p className="font-bold text-on-surface">Pengiriman Cepat</p>
                      <p className="text-sm text-on-surface-variant">Prioritas pengiriman untuk semua pesanan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
