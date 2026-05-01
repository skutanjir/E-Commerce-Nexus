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
  seller_id?: string;
  shop_name?: string;
}

const getAvailableVouchers = (cartItems: CartItem[]) => {
  const vouchers: Record<string, { code: string; discount: number; sellerId: string; shopName: string }> = {};
  
  const uniqueSellers = Array.from(new Set(cartItems.filter(i => i.seller_id).map(i => i.seller_id)));
  
  uniqueSellers.forEach((sellerId, index) => {
    const item = cartItems.find(i => i.seller_id === sellerId);
    if (item && item.shop_name) {
      const shopPrefix = item.shop_name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
      const code = `${shopPrefix}HEMAT`;
      vouchers[code] = {
        code,
        discount: 0.10 + (index * 0.05),
        sellerId: sellerId as string,
        shopName: item.shop_name
      };
    }
  });

  vouchers['NEXUS10'] = { code: 'NEXUS10', discount: 0.10, sellerId: 'GLOBAL', shopName: 'Semua Toko' };
  
  return vouchers;
};

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; sellerId: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

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

  const applyPromo = (overrideCode?: unknown) => {
    const code = (typeof overrideCode === 'string' ? overrideCode : promoInput).trim().toUpperCase();
    if (!code) { setPromoError("Masukkan kode promo terlebih dahulu."); return; }
    const availableVouchers = getAvailableVouchers(cartItems);
    const voucher = availableVouchers[code];
    if (!voucher) {
      setPromoError("Kode promo tidak valid atau tidak berlaku untuk barang di keranjang Anda.");
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo({ code, discount: voucher.discount, sellerId: voucher.sellerId });
    if (typeof overrideCode === 'string') setPromoInput(code);
    setPromoError(null);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.sellerId === 'GLOBAL') {
      discountAmount = Math.round(subtotal * appliedPromo.discount);
    } else {
      const eligibleSubtotal = cartItems
        .filter(item => item.seller_id === appliedPromo.sellerId)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      discountAmount = Math.round(eligibleSubtotal * appliedPromo.discount);
    }
  }
  
  const total = subtotal - discountAmount;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-on-surface">
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
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-24 sm:h-24 aspect-square sm:aspect-auto rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                      {item.image_url ? (
                        <img
                          alt={item.name}
                          className="w-full h-full object-cover"
                          src={item.image_url}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
                          <span className="material-symbols-outlined text-4xl opacity-50">inventory_2</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-lg leading-tight text-on-surface">{item.name}</h3>
                          <div className="flex items-center gap-1 mt-1 text-xs font-medium text-on-surface-variant">
                            <span className="material-symbols-outlined text-[14px]">store</span>
                            <span>{item.shop_name || 'Toko tidak diketahui'}</span>
                          </div>
                        </div>
                        <span className="font-bold text-xl text-primary">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-between items-end mt-4 gap-4">
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
                          Rp {Number(item.price).toLocaleString('id-ID')} / item
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
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Diskon ({appliedPromo.code} -{Math.round(appliedPromo.discount * 100)}%)</span>
                      <span className="font-medium">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Estimasi Pengiriman</span>
                    <span className="font-medium text-primary">Gratis</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <span className="font-bold text-lg text-on-surface">Total Harga</span>
                    <span className="font-black text-2xl text-primary tracking-tighter">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-on-surface mb-2">Kode Promo</label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="font-bold text-sm">{appliedPromo.code}</span>
                        <span className="text-sm">— hemat {Math.round(appliedPromo.discount * 100)}%</span>
                      </div>
                      <button onClick={removePromo} className="text-green-600 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="flex-grow bg-surface border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline text-sm uppercase"
                          placeholder="Masukkan kode promo"
                          type="text"
                          value={promoInput}
                          onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                          onKeyDown={e => e.key === 'Enter' && applyPromo()}
                        />
                        <button
                          onClick={applyPromo}
                          className="bg-surface-container-highest text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all text-sm whitespace-nowrap"
                        >
                          Gunakan
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {promoError}
                        </p>
                      )}
                      
                      <div className="mt-3">
                        <p className="text-xs font-bold text-on-surface-variant mb-2">Voucher Tersedia:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(getAvailableVouchers(cartItems)).map(voucher => (
                            <button
                              key={voucher.code}
                              onClick={() => applyPromo(voucher.code)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                                promoInput === voucher.code ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                              }`}
                              title={voucher.sellerId === 'GLOBAL' ? 'Berlaku untuk semua toko' : `Berlaku khusus untuk toko ${voucher.shopName}`}
                            >
                              {voucher.code} ({(voucher.discount*100).toFixed(0)}%)
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
