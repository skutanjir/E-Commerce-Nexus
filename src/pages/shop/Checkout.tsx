import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";
import type { Address } from "../../types";

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
      hide?: () => void;
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

const PAYMENT_METHODS = [
  { icon: "account_balance", label: "Transfer Bank", desc: "BCA, BNI, BRI, Mandiri" },
  { icon: "qr_code_2", label: "QRIS", desc: "Scan QR dari aplikasi apapun" },
  { icon: "wallet", label: "E-Wallet", desc: "GoPay, ShopeePay, OVO" },
  { icon: "store", label: "Minimarket", desc: "Indomaret, Alfamart" },
  { icon: "credit_card", label: "Kartu Kredit", desc: "Visa, Mastercard, JCB" },
];

export default function CheckoutFlow() {
  const { toast, confirm: confirmAction } = usePopup();
  const navigate = useNavigate();
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle" | "success" | "pending" | "error">("idle");
  const [snapReady, setSnapReady] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
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

    if (window.snap) {
      setSnapReady(true);
      return;
    }

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      console.warn("VITE_MIDTRANS_CLIENT_KEY not set");
    }

    const existing = document.querySelector('script[src*="snap.js"]');
    if (existing) {
      const interval = setInterval(() => {
        if (window.snap) { setSnapReady(true); clearInterval(interval); }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement("script");
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey || "");
    script.onload = () => setSnapReady(true);
    script.onerror = () => console.warn("Midtrans snap.js gagal dimuat.");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    async function loadSavedAddresses() {
      try {
        if (!user) { setUseNewAddress(true); setAddressLoading(false); return; }

        const { data } = await api.get("/addresses");

        if (data && data.length > 0) {
          setSavedAddresses(data as Address[]);
          const def = (data as Address[]).find(a => a.is_default) ?? (data as Address[])[0];
          setSelectedAddressId(def.id);
          setForm({
            fullName: def.full_name,
            phone: def.phone,
            address: def.address_line,
            city: def.city || "",
            postalCode: def.postal_code || "",
          });
        } else {
          setUseNewAddress(true);
        }
      } catch (err) {
        setUseNewAddress(true);
      } finally {
        setAddressLoading(false);
      }
    }
    loadSavedAddresses();
  }, [user]);

  const navToOrder = (id: string) =>
    navigate(`/user-dashboard-orders/${id}`);

  useEffect(() => {
    if (!successOrderId) return;
    if (countdown <= 0) {
      navToOrder(successOrderId);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [successOrderId, countdown, navigate]);

  const selectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setForm({
      fullName: addr.full_name,
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city || "",
      postalCode: addr.postal_code || "",
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + selectedShipping.price;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (useNewAddress) {
      if (!form.fullName || !form.phone || !form.address || !form.city || !form.postalCode) {
        toast("Mohon lengkapi semua data pengiriman terlebih dahulu.", 'error');
        return;
      }
    } else {
      if (!selectedAddressId && savedAddresses.length === 0) {
        toast("Tambahkan alamat pengiriman terlebih dahulu di dashboard.", 'error');
        return;
      }
    }
    if (cartItems.length === 0) {
      toast("Keranjang belanja kosong.", 'error');
      return;
    }

    setLoading(true);
    let snapLaunched = false;
    try {
      if (!user) {
        toast("Sesi login habis. Silakan login ulang.", 'error');
        navigate("/login-page");
        return;
      }

      // 1. Create order & order items in database
      const orderPayload = {
        total_amount: total,
        shipping_address: `${form.fullName} | ${form.phone} | ${form.address}, ${form.city} ${form.postalCode}`,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price
        }))
      };

      const res = await api.post('/orders', orderPayload);
      const order = res.data;

      if (!window.snap) {
        let waited = 0;
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            waited += 200;
            if (window.snap || waited >= 5000) {
              clearInterval(check);
              resolve();
            }
          }, 200);
        });
      }

      if (!window.snap) {
        toast("Sistem pembayaran belum siap. Refresh halaman lalu coba lagi.");
        setLoading(false);
        return;
      }

      // 2. Request Midtrans snap token
      const snapPayload = {
        order_id: order.id,
        gross_amount: Math.round(total),
        customer_details: {
          first_name: form.fullName || "Customer",
          phone: form.phone || "",
          billing_address: {
            address: form.address || "",
            city: form.city || "",
            postal_code: form.postalCode || "",
            country_code: "IDN",
          },
          shipping_address: {
            address: form.address || "",
            city: form.city || "",
            postal_code: form.postalCode || "",
            country_code: "IDN",
          }
        },
        item_details: [
          ...cartItems.map(item => ({
            id: item.id,
            name: item.name.substring(0, 50),
            price: Math.round(item.price),
            quantity: item.quantity
          })),
          {
            id: selectedShipping.id,
            name: `Ongkos Kirim - ${selectedShipping.name}`,
            price: selectedShipping.price,
            quantity: 1
          }
        ]
      };

      const snapRes = await api.post('/payments/snap', snapPayload);
      const snapToken = snapRes.data.token;

      if (!snapToken) {
        throw new Error("Token pembayaran tidak diterima");
      }

      const capturedOrderId = order.id;
      let successHandled = false;

      const markSuccess = async () => {
        if (successHandled) return;
        successHandled = true;
        window.snap.hide?.();
        localStorage.removeItem("nexus_cart");
        window.dispatchEvent(new Event("nexus:cart-updated"));
        setCartItems([]);
        setPayStatus("success");
        setLoading(false);
        setSuccessOrderId(capturedOrderId);
        setCountdown(5);
        // Backend webhook handles the definitive status update, but we do a fast optimist update
        await api.put(`/orders/${capturedOrderId}/payment`, {
          payment_status: 'paid',
          status: 'shipped'
        });
      };

      window.snap.pay(snapToken, {
        onSuccess: markSuccess,
        onPending: () => {
          setPayStatus("pending");
          setLoading(false);
        },
        onError: () => {
          setPayStatus("error");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
          if (successHandled) return;
          // Optimistic poll checking
          let attempt = 0;
          const poll = async () => {
            if (successHandled || attempt >= 6) return;
            attempt++;
            try {
              const { data } = await api.get(`/orders/${capturedOrderId}`);
              if (data?.payment_status === "paid") { markSuccess(); return; }
            } catch { /* ignore */ }
            setTimeout(poll, 1000);
          };
          setTimeout(poll, 500);
        },
      });
      snapLaunched = true;
      return;
    } catch (err: any) {
      console.error("Gagal memproses pembayaran:", err);
      const msg = err.response?.data?.error || err.message || "Terjadi kesalahan.";
      if (msg.includes("Sesi") || msg.toLowerCase().includes("unauthorized")) {
        toast("Sesi login habis. Silakan login ulang.", 'error');
        navigate("/login-page");
        return;
      }
      setPayStatus("error");
      setLoading(false);
    } finally {
      if (!snapLaunched) setLoading(false);
    }
  };

  if (cartItems.length === 0 && payStatus === "idle" && !successOrderId) {
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
      {successOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
              <span className="material-symbols-outlined text-5xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface mb-2">Pembayaran Berhasil!</h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Pesanan kamu sedang diproses. Terima kasih telah berbelanja di <strong>NEXUS</strong>!
            </p>
            <div className="w-full bg-surface-container-low rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">ID Pesanan</p>
              <p className="font-mono font-bold text-primary text-lg">#{successOrderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <button
              onClick={() => navToOrder(successOrderId!)}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all mb-3 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              Lihat Detail Pesanan
            </button>
            <p className="text-xs text-on-surface-variant">
              Mengalihkan otomatis dalam <span className="font-bold text-primary">{countdown}</span> detik...
            </p>
          </div>
        </div>
      )}
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">

        {/* Status Alerts */}
        {payStatus === "pending" && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl flex items-center gap-3 font-semibold">
            <span className="material-symbols-outlined">pending</span>
            Pembayaran sedang diproses. Selesaikan pembayaran Anda.
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
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -translate-y-1/2 -z-10" />
            {[{ n: 1, label: "Alamat" }, { n: 2, label: "Pengiriman" }, { n: 3, label: "Pembayaran" }].map(({ n, label }) => (
              <div key={n} className="flex flex-col items-center gap-3 bg-surface px-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary text-on-primary ring-4 ring-primary-fixed">
                  {n}
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-primary">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Step 1: Alamat */}
            <section className="tonal-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Alamat Pengiriman</h2>
              </div>

              {/* Saved addresses */}
              {addressLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-20 bg-surface-container-low animate-pulse rounded-lg" />)}
                </div>
              ) : !useNewAddress && savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {savedAddresses.map(addr => (
                    <label
                      key={addr.id}
                      onClick={() => selectAddress(addr)}
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/20 hover:border-primary/40 bg-surface-container-lowest"
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAddressId === addr.id ? "border-primary bg-primary" : "border-outline-variant"
                      }`}>
                        {selectedAddressId === addr.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-on-surface text-sm">{addr.label}</span>
                          {addr.is_default && (
                            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Utama</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-on-surface">{addr.full_name} · {addr.phone}</p>
                        <p className="text-sm text-on-surface-variant truncate">
                          {addr.address_line}{addr.city ? `, ${addr.city}` : ""}{addr.postal_code ? ` ${addr.postal_code}` : ""}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => { setUseNewAddress(true); setSelectedAddressId(null); setForm({ fullName: "", phone: "", address: "", city: "", postalCode: "" }); }}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline mt-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                    Gunakan Alamat Lain
                  </button>
                </div>
              ) : (
                <div>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => { setUseNewAddress(false); const def = savedAddresses.find(a => a.is_default) ?? savedAddresses[0]; selectAddress(def); setSelectedAddressId(def.id); }}
                      className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Kembali ke Alamat Tersimpan
                    </button>
                  )}
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
                </div>
              )}
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
                      Rp {Number(opt.price).toLocaleString("id-ID")}
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

            {/* Step 3: Payment Methods */}
            <section className="tonal-card rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Metode Pembayaran</h2>
              </div>
              <p className="text-sm text-on-surface-variant mb-5">Pilih metode pembayaran favoritmu. Setelah klik "Bayar Sekarang", popup Midtrans akan muncul dengan semua pilihan berikut:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <div key={pm.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{pm.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{pm.label}</p>
                      <p className="text-xs text-on-surface-variant">{pm.desc}</p>
                    </div>
                  </div>
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

          {/* Right Column: Summary */}
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
                  <span className="text-sm font-medium">Rp {Number(selectedShipping.price).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="pt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Total Tagihan</span>
                  <span className="text-xl font-black text-primary">Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={loading || payStatus === "success" || !snapReady}
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

            <div className="bg-surface-container-highest/30 border-2 border-dashed border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Pembayaran Aman</p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Transaksi diproses secara aman oleh <strong>Midtrans</strong>. Mendukung QRIS, BCA/BNI/BRI Virtual Account, GoPay, ShopeePay, kartu kredit, Indomaret, dan Alfamart.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>Terenkripsi dengan SSL 256-bit</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
