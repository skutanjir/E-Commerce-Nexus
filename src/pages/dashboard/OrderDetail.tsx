import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardNav from '../../components/layout/DashboardNav';
import type { Order } from '../../types';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: { onSuccess?: (r: unknown) => void; onPending?: (r: unknown) => void; onError?: (r: unknown) => void; onClose?: () => void; }) => void;
      hide?: () => void;
    };
  }
}

// Extract base URL for socket matching Backend Config
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Pembayaran',
  shipped: 'Sedang Dikirim',
  delivered: 'Selesai',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  shipped: 'bg-blue-100 text-blue-700 border-blue-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, authLoading } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapReady, setSnapReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const repaySuccessRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) { navigate('/user-dashboard-orders'); return; }
    if (authLoading) return;
    if (!user) { navigate('/login-page'); return; }

    async function fetchOrder() {
      try {
        const { data } = await api.get(`/orders/${id}`);

        // Merge navigate state (payment baru selesai) supaya status langsung benar
        const navState = location.state as { payment_status?: string; status?: string } | null;
        const merged = navState ? { ...data, ...navState } : data;
        setOrder(merged);
      } catch (error) {
        console.error(error);
        navigate('/user-dashboard-orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, authLoading, user, navigate, location.state]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txStatus = params.get('transaction_status');
    if (txStatus === 'settlement' || txStatus === 'capture') {
      localStorage.removeItem('nexus_cart');
      window.dispatchEvent(new Event('nexus:cart-updated'));
      if (id) {
        api.put(`/orders/${id}/payment`, {
          payment_status: 'paid', status: 'shipped'
        }).then(() => {
          setOrder(prev => prev ? { ...prev, payment_status: 'paid', status: 'shipped' } : prev);
        }).catch(err => console.error(err));
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [id]);

  // Real-time subscription: auto-refresh when payment status changes server-side
  useEffect(() => {
    if (!id || !order || order.payment_status === 'paid') return;

    const socket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_order', id);
    });

    socket.on('order_updated', (updatedData: { payment_status?: string; status?: string }) => {
      if (updatedData.payment_status === 'paid') {
        setOrder(prev => prev ? { ...prev, payment_status: 'paid', status: updatedData.status || prev.status } : prev);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id, order?.payment_status]);

  useEffect(() => {
    if (window.snap) { setSnapReady(true); return; }
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const existing = document.querySelector('script[src*="snap.js"]');
    if (existing) {
      const interval = setInterval(() => { if (window.snap) { setSnapReady(true); clearInterval(interval); } }, 100);
      return () => clearInterval(interval);
    }
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey || "");
    script.onload = () => setSnapReady(true);
    document.head.appendChild(script);
  }, []);

  const handleRepay = async () => {
    if (!order || !user || !snapReady) return;
    repaySuccessRef.current = false;
    setPaying(true);
    try {
      const addrParts = (order.shipping_address || '').split(' | ');
      const grossAmount = Math.round(order.total_amount);

      // We recreate the midtrans snap payload using our backend logic
      const snapPayload = {
        order_id: order.id,
        gross_amount: grossAmount,
        customer_details: {
          first_name: addrParts[0] || 'Customer',
          phone: addrParts[1] || '',
          billing_address: { address: addrParts[2] || '', city: '', postal_code: '', country_code: 'IDN' },
          shipping_address: { address: addrParts[2] || '', city: '', postal_code: '', country_code: 'IDN' },
        },
        item_details: [{ id: `order-${order.id.slice(0, 8)}`, name: 'Total Pesanan', price: grossAmount, quantity: 1 }],
      };

      const res = await api.post('/payments/snap', snapPayload);
      const token = res.data.token || order.snap_token;

      if (!token) {
        alert('Token pembayaran tidak tersedia. Silakan hubungi admin.');
        setPaying(false);
        return;
      }

      // We don't necessarily need to store it manually, but we can optimistically update
      if (res.data.token) {
        setOrder(prev => prev ? { ...prev, snap_token: res.data.token } : prev);
      }

      window.snap.pay(token, {
        onSuccess: async () => {
          repaySuccessRef.current = true;
          window.snap.hide?.();

          await api.put(`/orders/${order.id}/payment`, {
            payment_status: 'paid', status: 'shipped', snap_token: token
          });

          localStorage.removeItem('nexus_cart');
          window.dispatchEvent(new Event('nexus:cart-updated'));
          setOrder(prev => prev ? { ...prev, payment_status: 'paid', status: 'shipped' } : prev);
          setPaying(false);
        },
        onPending: () => setPaying(false),
        onError: () => setPaying(false),
        onClose: async () => {
          if (repaySuccessRef.current) { setPaying(false); return; }
          setPaying(false);
          // Cek DB — onSuccess kadang tidak terpanggil di beberapa metode pembayaran
          try {
            const { data } = await api.get(`/orders/${order.id}`);
            if (data?.payment_status === 'paid') {
              setOrder(prev => prev ? { ...prev, payment_status: 'paid', status: data.status || 'shipped' } : prev);
            }
          } catch {
            // ignore
          }
        },
      });
    } catch {
      setPaying(false);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleCancelUnpaid = async () => {
    if (!order || !user) return;
    if (!confirm('Batalkan pesanan ini?')) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${order.id}/cancel`);
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch (err) {
      console.error(err);
      alert('Gagal membatalkan pesanan.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <DashboardNav profile={profile} />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <DashboardSidebar profile={profile} />

          <div className="md:col-span-9 space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/user-dashboard-orders')}
                className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-2xl font-black text-on-surface tracking-tight">Detail Pesanan</h1>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-surface-container-low animate-pulse rounded-xl" />
                ))}
              </div>
            ) : order ? (
              <>
                {/* Order Header */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">ID Pesanan</p>
                      <p className="font-mono font-bold text-on-surface text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase border ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  {order.shipping_address && (
                    <div className="border-t border-outline-variant/10 pt-4 mt-4">
                      <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                      <p className="text-sm text-on-surface leading-relaxed">{order.shipping_address}</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                    <h2 className="font-bold text-on-surface">Produk Dipesan</h2>
                    <span className="ml-auto text-xs text-on-surface-variant">{order.order_items?.length || 0} item</span>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {order.order_items?.map((item, i) => (
                      <div key={i} className="flex gap-4 p-6 items-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                          {item.product?.image_url ? (
                            <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-outline">inventory_2</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{item.product?.name || 'Produk'}</p>
                          <p className="text-sm text-on-surface-variant">{item.quantity} × Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="font-bold text-primary text-sm flex-shrink-0">
                          Rp {(item.quantity * Number(item.price_at_purchase)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
                  <h2 className="font-bold text-on-surface mb-4">Ringkasan Pembayaran</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>Subtotal ({order.order_items?.length || 0} produk)</span>
                      <span>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>Status Pembayaran</span>
                      <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.payment_status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                      </span>
                    </div>
                    <div className="border-t border-outline-variant/10 pt-3 flex justify-between font-bold text-on-surface">
                      <span>Total</span>
                      <span className="text-primary text-lg">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {order.payment_status !== 'paid' && order.status === 'pending' && order.snap_token && (
                    <button
                      onClick={handleRepay}
                      disabled={paying || !snapReady}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">payments</span>
                      {paying ? 'Memproses...' : 'Bayar Sekarang'}
                    </button>
                  )}
                  {order.payment_status !== 'paid' && order.status === 'pending' && (
                    <button
                      onClick={handleCancelUnpaid}
                      disabled={cancelling}
                      className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-all disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                    </button>
                  )}
                  {order.payment_status === 'paid' && (order.status === 'shipped' || order.status === 'pending') && (
                    <button
                      onClick={() => navigate(`/user-dashboard-chat/${order.id}`)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      Chat Penjual
                    </button>
                  )}
                  {order.status === 'cancelled' && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <div>
                        <p className="font-bold text-red-700 text-sm">Pesanan Dibatalkan</p>
                        <p className="text-red-600 text-xs mt-0.5">Jika sudah dibayar, pengembalian dana akan diproses dalam 1–3 hari kerja.</p>
                      </div>
                    </div>
                  )}
                  {(order.status === 'pending' || order.status === 'shipped') && (
                    <Link
                      to={`/lacak-pesanan?id=${order.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">track_changes</span>
                      Lacak Pesanan
                    </Link>
                  )}
                  {(order.status === 'delivered' || order.status === 'completed') && (
                    <Link
                      to="/shop-catalogue"
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">shopping_bag</span>
                      Beli Lagi
                    </Link>
                  )}
                  <button
                    onClick={() => navigate(`/user-dashboard-chat/${order.id}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface border border-outline-variant/20 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chat_bubble</span>
                    Chat dengan Penjual
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
