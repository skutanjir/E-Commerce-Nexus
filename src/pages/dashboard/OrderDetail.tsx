import { usePopup } from '../../contexts/PopupContext';
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
      pay: (token: string, options?: any) => void;
      hide?: () => void;
    };
  }
}

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
  const { toast, confirm: confirmAction } = usePopup();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, authLoading } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [showReview, setShowReview] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/user-dashboard-orders'); return; }
    if (authLoading) return;
    if (!user) { navigate('/login-page'); return; }

    async function fetchOrder() {
      try {
        const { data } = await api.get(`/orders/${id}`);
        const navState = location.state as any;
        setOrder(navState ? { ...data, ...navState } : data);
      } catch (error) {
        navigate('/user-dashboard-orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, authLoading, user, navigate, location.state]);

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
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen relative">
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
              <div className="h-32 bg-surface-container-low animate-pulse rounded-xl" />
            ) : order ? (
              <>
                {/* Header Pesanan */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-mono font-bold text-on-surface text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase border ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* Daftar Produk */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10">
                    <h2 className="font-bold text-on-surface">Produk Dipesan</h2>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {order.order_items?.map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-4 p-6 items-center">
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
                        <div className="flex flex-col gap-2 items-end">
                          <p className="font-bold text-primary text-sm">
                            Rp {(item.quantity * Number(item.price_at_purchase)).toLocaleString('id-ID')}
                          </p>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                {order.status === 'completed' && (
                                   <>
                                     {!item.is_reviewed && (
                                       <button
                                         onClick={() => handleOpenReview(item.product)}
                                         className="px-4 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-bold transition-colors"
                                       >
                                         Beri Ulasan
                                       </button>
                                     )}
                                     <button 
                                       onClick={() => {
                                         if (item.product) {
                                           navigate(`/product/${item.product.id}`);
                                         }
                                       }}
                                       disabled={!item.product}
                                       className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                         item.product 
                                         ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest' 
                                         : 'bg-surface-container text-outline opacity-50 cursor-not-allowed'
                                       }`}
                                     >
                                       Beli Lagi
                                     </button>
                                   </>
                                )}
                                </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ringkasan & Action Buttons */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6">
                  <div className="flex justify-between font-bold text-on-surface mb-6">
                    <span>Total Pembayaran</span>
                    <span className="text-primary text-xl">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                     {/* Chat Penjual Dinamis Menuju ID Penjual Produk Pertama */}
                    <button
                      onClick={() => {
                        const sellerId = order.order_items?.[0]?.product?.seller_id;
                        if(sellerId) navigate(`/user-dashboard-chat/${sellerId}`);
                        else navigate('/user-dashboard-chat');
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface border border-outline-variant/20 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">chat_bubble</span>
                      Chat Penjual
                    </button>
                    
                    {order.status === 'delivered' && (
                       <button
                         onClick={async () => {
                           await api.put(`/orders/${order.id}/status`, { status: 'completed' });
                           setOrder({ ...order, status: 'completed' });
                           toast('Pesanan telah diselesaikan!', 'success');
                         }}
                         className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
                       >
                         <span className="material-symbols-outlined text-sm">check_circle</span>
                         Pesanan Diterima
                       </button>
                    )}
                  </div>
                </div>
              </>
            ) : null}
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
                <img src={reviewProduct?.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                <p className="font-bold text-sm text-on-surface line-clamp-2">{reviewProduct?.name}</p>
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