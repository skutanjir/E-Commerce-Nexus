import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import type { Order } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardNav from '../../components/layout/DashboardNav';

type StatusFilter = 'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-700',
};

const STATUS_ICON: Record<string, string> = {
  shipped: 'local_shipping',
  delivered: 'task_alt',
  completed: 'task_alt',
  cancelled: 'cancel',
  pending: 'pending_actions',
};

export default function UserDashboardOrders() {
  const { toast, confirm: confirmAction } = usePopup();
  const navigate = useNavigate();
  const { user, profile, authLoading } = useUser();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');

  // Review Modal State
  const [showReview, setShowReview] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login-page'); return; }

    async function fetchOrders() {
      try {
        const { data } = await api.get('/orders');
        if (data) setAllOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [authLoading, user, navigate]);

  const filteredOrders = activeTab === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === activeTab || (activeTab === 'delivered' && o.status === 'completed'));

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Belum Bayar' },
    { key: 'shipped', label: 'Dikirim' },
    { key: 'delivered', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  const handleOpenReview = (product: any) => {
    setReviewProduct(product);
    setRating(5);
    setComment('');
    setIsAnonymous(false);
    setShowReview(true);
  };

  const submitReview = async () => {
    if (!reviewProduct) return;
    setSubmittingReview(true);
    try {
      await api.post(`/products/${reviewProduct.id}/reviews`, {
        rating,
        comment,
        is_anonymous: isAnonymous
      });
      toast('Terima kasih! Ulasan Anda berhasil dikirim.', 'success');
      setShowReview(false);
    } catch (err: any) {
      toast(err.response?.data?.error || 'Gagal mengirim ulasan.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <DashboardNav profile={profile} />

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <DashboardSidebar profile={profile} />

          <div className="md:col-span-9 space-y-6">
            <h1 className="text-2xl font-black text-on-surface tracking-tight">Pesanan Saya</h1>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-outline-variant/10 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex-1 py-4 px-3 text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-b-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {tab.label}
                    {tab.key === 'all' && allOrders.length > 0 && (
                      <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {allOrders.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-surface-container-low animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">receipt_long</span>
                      <p className="mb-3">Belum ada pesanan di kategori ini.</p>
                      <Link to="/shop-catalogue" className="text-primary font-bold hover:underline">Mulai Belanja</Link>
                    </div>
                  ) : (
                    filteredOrders.map(order => {
                      const firstItem = order.order_items?.[0];
                      return (
                        <div key={order.id} className="p-6 hover:bg-surface-container-low transition-colors group">
                          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-4">
                              <span className="material-symbols-outlined text-primary">
                                {STATUS_ICON[order.status] || 'receipt_long'}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-outline uppercase tracking-wider">ID Pesanan</p>
                                <p className="text-sm font-bold text-on-surface font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal</p>
                                <p className="text-sm text-on-surface-variant">
                                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-700'}`}>
                                {STATUS_LABEL[order.status] || order.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex gap-4 flex-1">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10 flex-shrink-0 flex items-center justify-center">
                                {firstItem?.product?.image_url ? (
                                  <img src={firstItem.product.image_url} alt={firstItem.product?.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-outline">inventory_2</span>
                                )}
                              </div>
                              <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                                  {firstItem?.product?.name || 'Beberapa Produk'}
                                </h4>
                                {firstItem && (
                                  <p className="text-sm text-on-surface-variant">
                                    {firstItem.quantity} Barang × Rp {Number(firstItem.price_at_purchase).toLocaleString('id-ID')}
                                  </p>
                                )}
                                {order.order_items && order.order_items.length > 1 && (
                                  <p className="text-xs text-outline mt-1">+{order.order_items.length - 1} produk lainnya</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className="text-xs font-medium text-outline">Total Belanja</span>
                              <p className="text-xl font-black text-on-surface">Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.put(`/orders/${order.id}/status`, { status: 'completed' });
                                        setAllOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                                        toast('Pesanan telah diselesaikan!', 'success');
                                      } catch (err) {
                                        console.error(err);
                                        toast('Gagal menyelesaikan pesanan.', 'error');
                                      }
                                    }}
                                    className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-sm active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Pesanan Diterima
                                  </button>
                                )}
                                {order.status === 'completed' && (
                                  <>
                                    {!firstItem?.is_reviewed && (
                                      <button 
                                        onClick={() => handleOpenReview(firstItem?.product)}
                                        className="bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                      >
                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        Beri Rating
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => {
                                        if (firstItem?.product) {
                                          navigate(`/product/${firstItem.product.id}`);
                                        }
                                      }}
                                      disabled={!firstItem?.product}
                                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 ${
                                        firstItem?.product 
                                        ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-highest' 
                                        : 'bg-surface-container text-outline opacity-50 cursor-not-allowed border border-outline-variant/10'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                      Beli Lagi
                                    </button>
                                  </>
                                )}
                                {(order.status === 'pending' || order.status === 'shipped') && (
                                  <Link
                                    to={`/lacak-pesanan?id=${order.id}`}
                                    className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-sm">track_changes</span>
                                    Lacak
                                  </Link>
                                )}
                                <Link
                                  to={`/user-dashboard-orders/${order.id}`}
                                  className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all"
                                >
                                  Detail
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Beri Ulasan */}
        {showReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-on-surface">Beri Ulasan Produk</h3>
                <button onClick={() => setShowReview(false)} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                {reviewProduct?.image_url ? (
                  <img src={reviewProduct.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline">inventory_2</span>
                  </div>
                )}
                <p className="font-bold text-sm text-on-surface line-clamp-2">{reviewProduct?.name || 'Produk'}</p>
              </div>

              <div className="mb-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <span 
                      className={`material-symbols-outlined text-4xl transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                      style={{ fontVariationSettings: `'FILL' ${rating >= star ? 1 : 0}` }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan kepuasan Anda terhadap produk ini..."
                  className="w-full border border-outline-variant/20 rounded-xl p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <label htmlFor="anonymous" className="text-sm text-on-surface-variant cursor-pointer">
                  Sembunyikan nama saya (Anonim)
                </label>
              </div>

              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
