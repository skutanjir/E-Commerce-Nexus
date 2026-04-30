import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardNav from '../../components/layout/DashboardNav';
import type { Order, ChatMessage } from '../../types';

// Extract the base URL from API URL (removing /api if present) for socket connection
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Chat List View ────────────────────────────────────────────────────────────
function ChatList({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      try {
        const { data } = await api.get('/orders');
        if (data) setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  return (
    <div className="md:col-span-9 space-y-4">
      <h1 className="text-2xl font-black text-on-surface tracking-tight">Pesan</h1>
      <p className="text-sm text-on-surface-variant">Chat dengan penjual untuk setiap pesanan kamu.</p>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-surface-container-low animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">chat</span>
            <p className="mb-3">Belum ada pesanan untuk dichat.</p>
            <Link to="/shop-catalogue" className="text-primary font-bold hover:underline">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {orders.map(order => {
              const firstItem = order.order_items?.[0];
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/user-dashboard-chat/${order.id}`)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-surface-container-low transition-colors text-left"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/10 flex-shrink-0 flex items-center justify-center">
                    {firstItem?.product?.image_url ? (
                      <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline">inventory_2</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm truncate">{firstItem?.product?.name || 'Beberapa Produk'}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      order.status === 'cancelled' ? 'bg-slate-100 text-slate-700'
                      : order.payment_status === 'paid' ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'cancelled' ? 'Dibatalkan'
                        : order.payment_status === 'paid' ? 'Lunas'
                        : 'Belum Bayar'}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat Detail View ──────────────────────────────────────────────────────────
function ChatDetail({ orderId, navigate }: {
  orderId: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { user } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch order + messages
  useEffect(() => {
    if (!user || !orderId) return;
    async function load() {
      try {
        const [orderRes, msgRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get(`/chat/${orderId}`)
        ]);
        setOrder(orderRes.data);
        setMessages(msgRes.data);
      } catch (err) {
        console.error(err);
        navigate('/user-dashboard-chat');
      } finally {
        setLoadingOrder(false);
      }
    }
    load();
  }, [orderId, user, navigate]);

  // Real-time subscription using socket.io
  useEffect(() => {
    if (!orderId) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Typically join a room based on the orderId
      socket.emit('join_order', orderId);
    });

    socket.on('new_message', (newMessage: ChatMessage) => {
      // Ensure the message belongs to this order
      if (newMessage.order_id === orderId) {
        setMessages(prev => {
          // Prevent duplicates if API already returned it
          const exists = prev.some(m => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msgText?: string, imageUrl?: string) => {
    if (!user || !order) return;
    const messageToSend = msgText ?? text.trim();
    if (!messageToSend && !imageUrl) return;
    setSending(true);

    try {
      await api.post('/chat', {
        order_id: orderId,
        message: messageToSend || null,
        image_url: imageUrl || null
      });
      // The socket event will trigger the append to state, or we can fetch/optimistic update
      // The backend emits 'new_message' on save.
      setText('');
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Gagal mengirim pesan.');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 1024 * 1024) {
      alert('Ukuran foto maksimal 1 MB.');
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { imageUrl } = res.data;
      await sendMessage('', imageUrl);
    } catch (err) {
      console.error(err);
      alert('Gagal upload foto.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loadingOrder) {
    return (
      <div className="md:col-span-9 space-y-4">
        <div className="h-10 w-48 bg-surface-container-low animate-pulse rounded-xl" />
        <div className="h-[500px] bg-surface-container-low animate-pulse rounded-xl" />
      </div>
    );
  }

  const firstItem = order?.order_items?.[0];

  return (
    <div className="md:col-span-9 flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/user-dashboard-chat')}
          className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10 flex-shrink-0 flex items-center justify-center">
            {firstItem?.product?.image_url ? (
              <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-outline text-sm">inventory_2</span>
            )}
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm line-clamp-1">{firstItem?.product?.name || 'Pesanan'}</p>
            <p className="text-xs text-on-surface-variant font-mono">#{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <Link
          to={`/user-dashboard-orders/${orderId}`}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">receipt_long</span>
          Detail
        </Link>
      </div>

      {/* Order status banner */}
      {order?.status === 'cancelled' && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
          <p className="text-xs text-red-700 font-semibold">Pesanan ini telah dibatalkan. Pengembalian dana dalam 1–3 hari kerja.</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-30">chat_bubble</span>
            <p className="text-sm">Mulai chat dengan penjual.</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.sender_role === 'user';
          // Render optimization: unique key
          const uniqueKey = msg.id || `msg-${index}`;

          if (msg.message_type === 'cancellation') {
            return (
              <div key={uniqueKey} className="flex justify-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-w-xs w-full text-center shadow-sm">
                  {firstItem?.product?.image_url && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-3 border border-red-100">
                      <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Pesanan Dibatalkan</p>
                  <p className="text-sm font-bold text-on-surface mb-2">
                    {firstItem?.product?.name || 'Produk'}
                  </p>
                  <p className="text-lg font-black text-red-600 mb-2">
                    Rp {order?.total_amount.toLocaleString('id-ID')}
                  </p>
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    Pembayaran Dikembalikan
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2">Estimasi 1–3 hari kerja</p>
                </div>
              </div>
            );
          }

          if (msg.message_type === 'system') {
            return (
              <div key={uniqueKey} className="flex justify-center">
                <span className="text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">{msg.message}</span>
              </div>
            );
          }

          return (
            <div key={uniqueKey} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                isMe
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/10'
              }`}>
                {!isMe && <p className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-wider">Penjual</p>}
                {msg.image_url && (
                  <img
                    src={msg.image_url}
                    alt="Foto"
                    className="rounded-xl mb-1 max-w-full max-h-48 object-cover cursor-pointer"
                    onClick={() => window.open(msg.image_url!, '_blank')}
                  />
                )}
                {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-on-surface-variant'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors flex-shrink-0 disabled:opacity-50"
          title="Kirim foto (maks. 1 MB)"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-xl">image</span>
          )}
        </button>
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl flex items-end overflow-hidden">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Tulis pesan..."
            rows={1}
            className="w-full px-4 py-3 bg-transparent outline-none text-sm text-on-surface resize-none max-h-32"
          />
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={!text.trim() || sending}
          className="p-3 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">send</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const { user, profile, authLoading } = useUser();

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate('/login-page');
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <DashboardNav profile={profile} />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
          <DashboardSidebar profile={profile} />
          {orderId ? (
            <ChatDetail orderId={orderId} navigate={navigate} />
          ) : (
            <ChatList navigate={navigate} />
          )}
        </div>
      </main>
    </>
  );
}
