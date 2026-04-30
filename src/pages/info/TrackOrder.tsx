import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import { Link, useSearchParams } from 'react-router-dom';

interface TrackedOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: {
    quantity: number;
    price_at_purchase: number;
    product?: { name: string; image_url: string | null };
  }[];
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Pesanan Diterima', icon: 'receipt_long', desc: 'Pesanan Anda sedang menunggu konfirmasi.' },
  { key: 'shipped', label: 'Sedang Dikirim', icon: 'local_shipping', desc: 'Paket Anda dalam perjalanan menuju tujuan.' },
  { key: 'delivered', label: 'Sudah Sampai', icon: 'markunread_mailbox', desc: 'Paket telah tiba di alamat pengiriman.' },
  { key: 'completed', label: 'Selesai', icon: 'task_alt', desc: 'Pesanan telah dikonfirmasi selesai.' },
];

const STATUS_ORDER = ['pending', 'shipped', 'delivered', 'completed'];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, authLoading } = useUser();

  // Auto-track if id is passed in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && user && !authLoading) {
      setOrderId(idFromUrl);
      handleTrackById(idFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleTrackById = async (id: string) => {
    if (authLoading) return;
    try {
      setLoading(true);
      setError(null);
      setOrder(null);

      const cleanId = id.trim().replace(/^#/, '').toLowerCase();

      if (!user) {
        setError('Silakan login terlebih dahulu untuk melacak pesanan.');
        return;
      }

      // Try exact match first (full UUID from URL), then prefix match (short ID from display)
      const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(cleanId);

      let data;
      if (isFullUuid) {
        const res = await api.get(`/orders/${cleanId}`);
        data = res.data;
      } else {
        // Fetch all orders and find by prefix
        const res = await api.get('/orders');
        const rows = res.data;
        data = rows?.find((o: any) => o.id.replace(/-/g, '').startsWith(cleanId.replace(/-/g, ''))) ?? null;
      }

      if (!data) {
        setError('Nomor pesanan tidak ditemukan. Pastikan nomor yang dimasukkan benar.');
      } else {
        setOrder(data);
      }
    } catch {
      setError('Terjadi kesalahan saat mencari pesanan.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    await handleTrackById(orderId);
  };

  const currentStepIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  const getStatusLabel = (status: string) => {
    if (status === 'cancelled') return 'Dibatalkan';
    return STATUS_STEPS.find(s => s.key === status)?.label || status;
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 max-w-3xl mx-auto px-4 w-full">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary text-4xl">track_changes</span>
          <h1 className="text-3xl font-black text-on-surface">Lacak Pesanan</h1>
        </div>

        <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">ID Pesanan</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Contoh: ABCD1234 (8 karakter pertama ID pesanan)"
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary outline-none text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />}
                  Lacak
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm border border-error/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">ID Pesanan</p>
                  <p className="font-mono font-bold text-on-surface">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="text-sm text-on-surface">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Total</p>
                  <p className="font-black text-primary">Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              {/* Products */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="border-t border-outline-variant/10 pt-4 space-y-3">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline w-full h-full flex items-center justify-center">inventory_2</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface">{item.product?.name || 'Produk'}</p>
                        <p className="text-xs text-on-surface-variant">{item.quantity}x × Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline - only for non-cancelled */}
            {order.status !== 'cancelled' ? (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
                <h3 className="font-black text-on-surface mb-6 text-sm uppercase tracking-widest">Timeline Pengiriman</h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-outline-variant/20" />
                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, i) => {
                      const done = currentStepIndex >= i;
                      const active = currentStepIndex === i;
                      return (
                        <div key={step.key} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                            done ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface-container-low text-outline'
                          }`}>
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>
                              {step.icon}
                            </span>
                          </div>
                          <div className="flex-1 pt-1.5">
                            <p className={`font-bold text-sm ${done ? 'text-on-surface' : 'text-outline'}`}>{step.label}</p>
                            {active && <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>}
                            {done && !active && (
                              <p className="text-xs text-primary mt-0.5 font-medium">Selesai</p>
                            )}
                          </div>
                          {active && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider self-start mt-1">
                              Saat ini
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">cancel</span>
                <div>
                  <p className="font-bold text-red-700">Pesanan Dibatalkan</p>
                  <p className="text-sm text-red-600">Pesanan ini telah dibatalkan.</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link to="/user-dashboard-orders" className="text-primary font-bold text-sm hover:underline flex items-center gap-1 justify-center">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Lihat Semua Pesanan
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
