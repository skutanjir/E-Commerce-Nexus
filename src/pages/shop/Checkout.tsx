import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { supabase } from "../../lib/supabase";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

const SHIPPING_OPTIONS = [
  { id: "jne-reg", name: "JNE Reguler", price: 12000, eta: "2 – 4 Hari Kerja", logo: "local_shipping" },
  { id: "jnt-exp", name: "J&T Express", price: 15000, eta: "1 – 3 Hari Kerja", logo: "rocket_launch" },
  { id: "sicepat", name: "SiCepat Halu", price: 9000, eta: "3 – 5 Hari Kerja", logo: "bolt" },
];

export default function CheckoutFlow() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle" | "success" | "pending" | "error">("idle");
  const [snapReady, setSnapReady] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("nexus_cart");
    if (saved) setCartItems(JSON.parse(saved));

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      console.warn("VITE_MIDTRANS_CLIENT_KEY tidak di-set. Midtrans tidak akan berjalan.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => setSnapReady(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + selectedShipping.price;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.postalCode) {
      alert("Mohon lengkapi semua data pengiriman terlebih dahulu.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Keranjang belanja kosong.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id,
          total_amount: total,
          status: "pending",
          shipping_address: `${form.fullName} | ${form.phone} | ${form.address}, ${form.city} ${form.postalCode}`,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      if (order) {
        await supabase.from("order_items").insert(
          cartItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price,
          }))
        );

        if (!snapReady || !window.snap) {
          alert(
            "Midtrans Snap belum siap. Pastikan VITE_MIDTRANS_CLIENT_KEY telah di-set di file .env dan server backend (Supabase Edge Function) telah dikonfigurasi untuk menghasilkan snap_token."
          );
          setLoading(false);
          return;
        }

        /* Untuk produksi:
         * Panggil Supabase Edge Function untuk mendapatkan snap_token:
         *
         * const { data: snapData } = await supabase.functions.invoke("create-payment", {
         *   body: { orderId: order.id, amount: total, customer: form, items: cartItems }
         * });
         * const snapToken = snapData.token;
         */
        const snapToken = import.meta.env.VITE_MIDTRANS_SNAP_TOKEN || "";

        window.snap.pay(snapToken, {
          onSuccess: () => {
            localStorage.removeItem("nexus_cart");
            window.dispatchEvent(new Event("nexus:cart-updated"));
            setPayStatus("success");
            setTimeout(() => navigate("/user-dashboard"), 2500);
          },
          onPending: () => setPayStatus("pending"),
          onError: () => setPayStatus("error"),
          onClose: () => setLoading(false),
        });
      }
    } catch (err) {
      console.error("Gagal memproses pembayaran:", err);
      setPayStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 flex flex-col items-center justify-center min-h-screen">
          <span className="material-symbols-outlined text-7xl text-outline mb-4">shopping_cart</span>
          <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
          <p className="text-on-surface-variant mb-6">Tambahkan produk sebelum melanjutkan ke checkout.</p>
          <Link to="/shop-catalogue" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all">
            Mulai Belanja
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 checkout-container px-6 max-w-7xl mx-auto">

        {/* Status Alerts */}
        {payStatus === "success" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 font-semibold">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Pembayaran berhasil! Mengalihkan ke dashboard Anda...
          </div>
        )}
        {payStatus === "pending" && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl flex items-center gap-3 font-semibold">
            <span className="material-symbols-outlined">pending</span>
            Pembayaran Anda sedang diproses. Mohon selesaikan pembayaran.
          </div>
        )}
        {payStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 font-semibold">
            <span className="material-symbols-outlined">error</span>
            Pembayaran gagal. Silakan coba lagi.
          </div>
        )}

        {/* Stepper */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -translate-y-1/2 -z-10"></div>
            {[
              { n: 1, label: "Alamat" },
              { n: 2, label: "Pengiriman" },
              { n: 3, label: "Pembayaran" },
            ].map(({ n, label }) => (
              <div key={n} className="flex flex-col items-center gap-3 bg-surface px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  activeStep >= n
                    ? "bg-primary text-on-primary ring-4 ring-primary-fixed"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}>
                  {activeStep > n ? <span className="material-symbols-outlined text-sm">check</span> : n}
                </div>
                <span className={`text-xs font-bold tracking-widest uppercase ${activeStep >= n ? "text-primary" : "text-on-surface-variant"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Alamat */}
            <section className="tonal-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Detail Alamat Pengiriman</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama Penerima</label>
                  <input
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Contoh: Budi Santoso"
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nomor Telepon</label>
                  <input
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="+62 812-XXXX-XXXX"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Alamat Lengkap</label>
                  <textarea
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Nama Jalan, No. Rumah, RT/RW"
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kota / Kecamatan</label>
                  <input
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Pilih Kota"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kode Pos</label>
                  <input
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="12345"
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Pengiriman */}
            <section className="tonal-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Metode Pengiriman</h2>
              </div>
              <div className="space-y-4">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`relative flex items-center justify-between p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedShipping.id === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant/20 hover:border-primary/50 bg-surface-container-lowest"
                    }`}
                    onClick={() => setSelectedShipping(opt)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-primary text-2xl">{opt.logo}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface">{opt.name}</h4>
                        <p className="text-sm text-on-surface-variant">Estimasi tiba: {opt.eta}</p>
                      </div>
                    </div>
                    <span className={`font-black ${selectedShipping.id === opt.id ? "text-primary" : "text-on-surface"}`}>
                      Rp {opt.price.toLocaleString("id-ID")}
                    </span>
                    {selectedShipping.id === opt.id && (
                      <div className="absolute top-2 right-2">
                        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </section>

            {/* Items in cart */}
            <section className="tonal-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Produk Dipesan ({cartItems.length})</h2>
              </div>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-on-surface text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary text-sm">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Summary & Payment */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <section className="tonal-card rounded-xl p-8">
              <h3 className="text-lg font-bold text-on-surface mb-6">Ringkasan Belanja</h3>
              <div className="space-y-4 pb-6 border-b border-outline-variant/20">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="text-sm">Total Harga ({cartItems.length} Barang)</span>
                  <span className="text-sm font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="text-sm">Ongkos Kirim ({selectedShipping.name})</span>
                  <span className="text-sm font-medium">Rp {selectedShipping.price.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="pt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Total Tagihan</span>
                  <span className="text-xl font-black text-primary">Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">payments</span>
                      Bayar Sekarang
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Midtrans Info */}
            <section className="bg-surface-container-highest/30 border-2 border-dashed border-primary/20 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Midtrans Snap Payment
              </p>
              <p className="text-sm text-on-surface-variant">
                Setelah klik tombol bayar, popup pembayaran aman dari Midtrans akan muncul. Mendukung transfer bank, kartu kredit, GoPay, OVO, dan lainnya.
              </p>
            </section>

            <div className="flex items-center justify-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>Transaksi Aman &amp; Terenkripsi oleh Midtrans</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
