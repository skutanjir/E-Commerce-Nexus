import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import type { Profile } from '../../types';

interface DashboardNavProps {
  profile: Profile | null;
}

const SOCKET_URL = window.location.origin;

const getAvatarSrc = (url: string | undefined | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl}${url}`;
};

export default function DashboardNav({ profile }: DashboardNavProps) {
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    
    api.get('/chat/unread-count').then((res) => {
      if (res.data.unread_count > 0) setHasUnreadNotification(true);
    }).catch(() => {});

    const socket = io(SOCKET_URL, { reconnectionAttempts: 3, reconnectionDelayMax: 10000, timeout: 5000, path: '/socket.io/', transports: ['polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_user', profile.id);
    });

    socket.on('new_notification', () => {
      setHasUnreadNotification(true);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [profile]);

  const dashboardLink = profile?.role === 'seller' ? '/admin-dashboard-overview' : '/user-dashboard';
  const chatLink = profile?.role === 'seller' ? '/admin-dashboard-chat' : '/user-dashboard-chat';

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200/10 shadow-sm">
      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500">
          NEXUS
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium" to="/">Beranda</Link>
          <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium" to="/shop-catalogue">Toko</Link>
          <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium" to="/categories">Kategori</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/shopping-cart"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
          </Link>
          
          <Link 
            to={chatLink} 
            onClick={() => setHasUnreadNotification(false)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative hidden sm:flex"
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnreadNotification && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </Link>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(dashboardLink)}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{profile?.role || 'Member'}</p>
            </div>
            <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={getAvatarSrc(profile.avatar_url)} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
