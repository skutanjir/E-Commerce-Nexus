import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import SellerSidebar from '../../components/layout/SellerSidebar';
import DashboardNav from '../../components/layout/DashboardNav';
import type { ChatMessage } from '../../types';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function SellerChatList({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const { user } = useUser();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchContacts() {
      try {
        const { data } = await api.get('/chat/contacts');
        if (data) setContacts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, [user]);

  return (
    <div className="h-full flex flex-col px-4 lg:px-8 max-w-5xl mx-auto w-full pt-8 pb-4">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight mb-2">Pesan Pelanggan</h1>
        <p className="text-sm text-on-surface-variant">Kelola pesan dan balasan untuk pelanggan Anda.</p>
      </div>
      <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col min-h-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-surface-container-low animate-pulse rounded-xl" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">chat</span>
            <p>Belum ada pelanggan yang menghubungi Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10 flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => navigate(`/admin-dashboard-chat/${contact.id}`)}
                className="w-full flex items-center gap-4 p-4 lg:p-5 hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-surface-container-low flex-shrink-0 flex items-center justify-center">
                  {contact.avatar_url ? (
                    <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-2xl lg:text-3xl">person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm lg:text-base truncate">{contact.full_name || 'Pelanggan'}</p>
                  <p className="text-[10px] lg:text-xs text-on-surface-variant mt-0.5 truncate">{contact.email}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SellerChatDetail({ contactId, navigate }: { contactId: string; navigate: ReturnType<typeof useNavigate>; }) {
  const { toast } = usePopup();
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [contactName, setContactName] = useState('Pelanggan');
  const [contactAvatar, setContactAvatar] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !contactId) return;
    async function load() {
      try {
        const [msgRes, contactsRes] = await Promise.all([
          api.get(`/chat/messages/${contactId}`),
          api.get('/chat/contacts')
        ]);
        setMessages(msgRes.data);
        
        const thisContact = contactsRes.data.find((c: any) => c.id === contactId);
        if (thisContact) {
          setContactName(thisContact.full_name);
          setContactAvatar(thisContact.avatar_url);
        }
      } catch (err) {
        console.error(err);
        navigate('/admin-dashboard/chat');
      } finally {
        setLoadingInitial(false);
      }
    }
    load();
  }, [contactId, user, navigate]);

  useEffect(() => {
    if (!user || !contactId) return;
    const socket = io(SOCKET_URL, { reconnectionAttempts: 3, reconnectionDelayMax: 10000, timeout: 5000,
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_chat', { userId: contactId, sellerId: user.id });
    });

    socket.on('new_message', (newMessage: any) => {
      if ((newMessage.user_id === contactId && newMessage.seller_id === user.id) ||
          (newMessage.seller_id === contactId && newMessage.user_id === user.id)) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [contactId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msgText?: string, imageUrl?: string) => {
    if (!user) return;
    const messageToSend = msgText ?? text.trim();
    if (!messageToSend && !imageUrl) return;
    setSending(true);

    try {
      await api.post(`/chat/messages/${contactId}`, {
        message: messageToSend || null,
        image_url: imageUrl || null
      });
      setText('');
    } catch (err) {
      console.error('Failed to send message', err);
      toast('Gagal mengirim pesan.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 1024 * 1024) {
      toast('Ukuran foto maksimal 1 MB.', 'error');
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { url } = res.data;
      await sendMessage('', url);
    } catch (err) {
      console.error(err);
      toast('Gagal upload foto.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loadingInitial) {
    return (
      <div className="h-full flex flex-col pt-4 lg:pt-0 space-y-4">
        <div className="h-10 w-48 bg-surface-container-low animate-pulse rounded-xl" />
        <div className="flex-1 bg-surface-container-low animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-4 lg:pt-0">
      <div className="flex items-center gap-2 lg:gap-3 mb-4">
        <button
          onClick={() => navigate('/admin-dashboard-chat')}
          className="p-1.5 lg:p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-lg lg:text-2xl">arrow_back</span>
        </button>
        <div className="flex items-center gap-2 lg:gap-3 flex-1">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-surface-container-low flex-shrink-0 flex items-center justify-center">
            {contactAvatar ? (
              <img src={contactAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-outline text-lg lg:text-xl">person</span>
            )}
          </div>
          <div>
            <p className="font-bold text-on-surface text-xs lg:text-sm line-clamp-1">{contactName}</p>
            <p className="text-[9px] lg:text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-y-auto p-3 lg:p-4 space-y-3 min-h-0 flex flex-col">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl lg:text-4xl mb-2 lg:mb-3 opacity-30">chat_bubble</span>
            <p className="text-xs lg:text-sm">Belum ada pesan. Mulai obrolan dengan pembeli.</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user?.id;
          const uniqueKey = msg.id || `msg-${index}`;

          if (msg.message_type === 'cancellation') return null;

          if (msg.message_type === 'system') {
            return (
              <div key={uniqueKey} className="flex justify-center">
                <span className="text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">{msg.message}</span>
              </div>
            );
          }

          return (
            <div key={uniqueKey} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-3 lg:px-4 py-2 lg:py-2.5 shadow-sm ${
                isMe
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-surface-container-low text-on-surface rounded-bl-sm border border-outline-variant/10'
              }`}>
                {!isMe && <p className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-wider">Pelanggan</p>}
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

      <div className="mt-2 lg:mt-3 flex items-end gap-1.5 lg:gap-2">
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
          className="p-2 lg:p-3 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors flex-shrink-0 disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg lg:text-xl">image</span>
          )}
        </button>
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl flex items-end overflow-hidden">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ketik balasan..."
            rows={1}
            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-transparent outline-none text-xs lg:text-sm text-on-surface resize-none max-h-24 lg:max-h-32"
          />
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={!text.trim() || sending}
          className="p-2 lg:p-3 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg lg:text-xl">send</span>
        </button>
      </div>
    </div>
  );
}

export default function SellerChatPage() {
  const { toast, confirm: confirmAction } = usePopup();
  const { contactId } = useParams<{ contactId?: string }>();
  const navigate = useNavigate();
  const { user, authLoading } = useUser();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'seller') navigate('/login-page');
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-2rem)] lg:h-[calc(100vh-6rem)]">
      {contactId ? (
        <SellerChatDetail contactId={contactId} navigate={navigate} />
      ) : (
        <SellerChatList navigate={navigate} />
      )}
    </div>
  );
}