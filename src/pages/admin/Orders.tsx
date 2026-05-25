import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { useAdmin } from '../../contexts/AdminContext';
import type { Order, ChatMessage } from '../../types';

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

type OrderWithProfile = Order & {
  profile?: {
    full_name?: string | null;
    email?: string | null;
  };
};

// Seller doesn't have an ID directly inside profile anymore if we depend on context, using user.id inside context if needed
// Actually, let's grab it from the context
function ChatPanel({ order, sellerId, onClose }: { order: OrderWithProfile; sellerId: string | null; onClose: () => void }) {
  const { toast } = usePopup();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buyerId = order.user_id;

  useEffect(() => {
    if (!buyerId) return;
    async function loadMessages() {
      try {
        const { data } = await api.get(`/chat/messages/${buyerId}`);
        if (data) setMessages(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadMessages();
  }, [buyerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msgText?: string, imageUrl?: string) => {
    if (!sellerId || !buyerId) return;
    const messageToSend = msgText ?? text.trim();
    if (!messageToSend && !imageUrl) return;
    setSending(true);

    try {
      const { data } = await api.post(`/chat/messages/${buyerId}`, {
        message: messageToSend || null,
        image_url: imageUrl || null
      });
      if (data) setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
      setText('');
    } catch (err) {
      console.error(err);
      toast('Gagal mengirim pesan.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sellerId || !buyerId) return;
    if (file.size > 1024 * 1024) { toast('Ukuran foto maks 1 MB.'); return; }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await sendMessage('', res.data.url);
    } catch (err) {
      console.error(err);
      toast('Gagal upload foto.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const firstItem = order.order_items?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-surface-container-lowest shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10 bg-surface-container-low">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/10 flex-shrink-0 flex items-center justify-center">
            {firstItem?.product?.image_url ? (
              <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-outline text-sm">inventory_2</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface text-sm truncate">{firstItem?.product?.name || 'Pesanan'}</p>
            <p className="text-xs text-on-surface-variant font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-3 opacity-30">chat_bubble</span>
              <p className="text-sm">Belum ada pesan.</p>
            </div>
          )}
          {messages.map((msg, index) => {
            const isSeller = msg.sender_role === 'seller';
            const uniqueKey = msg.id || `msg-${index}`;

            if (msg.message_type === 'cancellation') {
              return (
                <div key={uniqueKey} className="flex justify-center">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-w-xs w-full text-center">
                    {firstItem?.product?.image_url && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-2 border border-red-100">
                        <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Pesanan Dibatalkan</p>
                    <p className="text-sm font-bold text-on-surface mb-1">{firstItem?.product?.name || 'Produk'}</p>
                    <p className="text-base font-black text-red-600 mb-2">Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                      Pembayaran Dikembalikan
                    </div>
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
              <div key={uniqueKey} className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isSeller
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/10'
                }`}>
                  {!isSeller && <p className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-wider">Pembeli</p>}
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="Foto"
                      className="rounded-xl mb-1 max-w-full max-h-40 object-cover cursor-pointer"
                      onClick={() => window.open(msg.image_url!, '_blank')}
                    />
                  )}
                  {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                  <p className={`text-[10px] mt-1 ${isSeller ? 'text-white/60' : 'text-on-surface-variant'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10 flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {uploading
              ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-xl">image</span>}
          </button>
          <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl flex items-end overflow-hidden">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Balas pesan..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent outline-none text-sm text-on-surface resize-none max-h-28"
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
    </div>
  );
}

export default function AdminOrderManagement() {
  const { toast, confirm: confirmAction } = usePopup();
  const { adminProfile, adminLoading } = useAdmin();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (adminLoading) return;
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/admin');
        if (data) setAllOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [adminLoading]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    } catch (err) {
      console.error(err);
      toast('Gagal update status', 'error');
    }
  };

  const handleCancelWithChat = async (order: Order) => {
    if (!(await confirmAction(`Batalkan pesanan #${order.id.slice(0, 8).toUpperCase()}? Pesan pembatalan akan dikirim ke pembeli.`))) return;
    setCancelling(order.id);

    try {
      await api.put(`/orders/${order.id}/cancel`);
      setAllOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));

      if (adminProfile && order.user_id) {
        await api.post(`/chat/messages/${order.user_id}`, {
          message: 'Maaf, pesanan Anda telah dibatalkan oleh penjual. Pengembalian dana akan diproses dalam 1–3 hari kerja.',
        });
      }
    } catch (err) {
      console.error(err);
      toast('Gagal membatalkan', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const filteredOrders = allOrders
    .filter(o => activeTab === 'all' || o.status === activeTab || (activeTab === 'delivered' && o.status === 'completed'))
    .filter(o =>
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'shipped', label: 'Dikirim' },
    { key: 'delivered', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  if (loading || adminLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen p-8">
      {chatOrder && (
        <ChatPanel order={chatOrder} sellerId={adminProfile?.id || null} onClose={() => setChatOrder(null)} />
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Manajemen Pesanan</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Kelola dan perbarui status semua pesanan.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Pesanan', value: allOrders.length, color: 'blue' },
          { label: 'Menunggu', value: allOrders.filter(o => o.status === 'pending').length, color: 'orange' },
          { label: 'Dikirim', value: allOrders.filter(o => o.status === 'shipped').length, color: 'blue' },
          { label: 'Selesai', value: allOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-low p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="border-b border-outline-variant/10">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari ID atau nama pelanggan..."
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex border-t border-outline-variant/10 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 flex-1 py-3 px-4 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-b-2 border-primary text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant/10">
                <th className="px-6 py-4">ID Pesanan</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ubah Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-on-surface-variant">Tidak ada pesanan ditemukan.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold font-mono text-primary">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-on-surface">{order.profile?.full_name || 'Guest'}</p>
                      <p className="text-xs text-on-surface-variant">{order.profile?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {order.order_items?.[0]?.product?.name || '—'}
                      {order.order_items && order.order_items.length > 1 && ` +${order.order_items.length - 1}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      Rp {Number(order.total_amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-700'}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled'}
                        className={`text-xs border border-outline-variant/20 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 text-on-surface ${
                          order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled'
                            ? 'bg-surface-container-low opacity-50 cursor-not-allowed'
                            : 'bg-surface cursor-pointer hover:border-primary/50'
                        }`}
                      >
                        <option value="pending">Menunggu</option>
                        <option value="shipped">Dikirim</option>
                        <option value="delivered">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setChatOrder(order)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          Chat
                        </button>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelWithChat(order)}
                            disabled={cancelling === order.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            {cancelling === order.id ? '...' : 'Batalkan'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
