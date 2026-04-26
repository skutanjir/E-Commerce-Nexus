import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("nexus_cart");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  const save = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("nexus_cart", JSON.stringify(items));
    window.dispatchEvent(new Event("nexus:cart-updated"));
  };

  const updateQty = (id: string, delta: number) => {
    save(cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    save(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-on-surface">
          Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="material-symbols-outlined text-7xl text-outline mb-6">shopping_cart</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Keranjang Masih Kosong</h2>
            <p className="text-on-surface-variant mb-8">Tambahkan produk untuk mulai belanja.</p>
            <Link
              to="/categories"
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_20px_40px_-15px_rgba(20,27,43,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(20,27,43,0.08)] transition-shadow"
                >
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg leading-tight text-on-surface">{item.name}</h3>
                        <span className="font-bold text-xl text-primary">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-outline-variant/30 rounded-lg bg-surface">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="px-3 py-1 hover:bg-surface-container-highest transition-colors"
                            >
                              -
                            </button>
                            <span className="px-4 font-semibold text-on-surface">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="px-3 py-1 hover:bg-surface-container-highest transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          Rp {item.price.toLocaleString('id-ID')} / item
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="lg:col-span-4 sticky top-24">
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_20px_40px_-15px_rgba(20,27,43,0.08)] border border-outline-variant/10">
                <h2 className="text-xl font-bold mb-6 text-on-surface">Ringkasan Pesanan</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal ({cartItems.length} Produk)</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Estimasi Pengiriman</span>
                    <span className="font-medium text-primary">Gratis</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <span className="font-bold text-lg text-on-surface">Total Harga</span>
                    <span className="font-black text-2xl text-primary tracking-tighter">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-on-surface mb-2">Kode Promo</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-grow bg-surface border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline"
                      placeholder="Masukkan kode promo"
                      type="text"
                    />
                    <button className="bg-surface-container-highest text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all">
                      Gunakan
                    </button>
                  </div>
                </div>
                <Link
                  to="/checkout-flow"
                  className="block w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-lg font-extrabold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all text-center"
                >
                  Lanjut ke Checkout
                </Link>
                <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant text-sm">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                  <span>Transaksi Aman &amp; Terenkripsi</span>
                </div>
              </div>
              <div className="mt-6 bg-primary/5 p-4 rounded-lg border border-primary/10 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Dapatkan cashback hingga{" "}
                  <span className="font-bold text-primary">Rp 50.000</span> dengan menggunakan NEXUS Pay saat checkout.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
