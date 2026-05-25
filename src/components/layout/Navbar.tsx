import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import type { Category } from '../../types';

const SOCKET_URL = window.location.origin;

function getCartCount(): number {
  const saved = localStorage.getItem("nexus_cart");
  if (!saved) return 0;
  const cart: { quantity: number }[] = JSON.parse(saved);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [animateCart, setAnimateCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

  const { user, profile: userProfile, logout } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    if (isMenuOpen) setIsMenuOpen(false);
    if (isCategoryOpen) setIsCategoryOpen(false);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  }

  // Socket.io for Real-time Bell Notifications
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch for unread status
    api.get('/chat/unread-count').then((res) => {
      if (res.data.unread_count > 0) setHasUnreadNotification(true);
    }).catch(() => {});

    const socket = io(SOCKET_URL, { reconnectionAttempts: 3, reconnectionDelayMax: 10000, timeout: 5000, path: '/socket.io/', transports: ['polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_user', user.userId);
    });

    socket.on('new_notification', () => {
      setHasUnreadNotification(true);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await api.get('/categories');
        if (data) setCategories(data.slice(0, 10)); // Limit to 10
      } catch (error: any) {
        console.error('Failed to fetch categories:', error.message);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const syncCart = () => {
      const newCount = getCartCount();
      if (newCount > cartCount) {
        setAnimateCart(true);
        setTimeout(() => setAnimateCart(false), 400);
      }
      setCartCount(newCount);
    };
    window.addEventListener("storage", syncCart);
    window.addEventListener("nexus:cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("nexus:cart-updated", syncCart);
    };
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop-catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const dashboardLink = userProfile?.role === 'seller' ? '/admin-dashboard-overview' : '/user-dashboard';
  const chatLink = userProfile?.role === 'seller' ? '/admin-dashboard-chat' : '/user-dashboard-chat';

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-md py-2'
          : 'bg-white dark:bg-slate-900 py-4 shadow-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500 hover:opacity-80 transition-opacity">
              NEXUS
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`} to="/">Beranda</Link>
            <Link className={`text-sm font-medium transition-colors ${location.pathname === '/shop-catalogue' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`} to="/shop-catalogue">Toko</Link>

            <div className="relative group">
              <button
                onMouseEnter={() => setIsCategoryOpen(true)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${isCategoryOpen ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`}
              >
                Kategori
                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              <div
                onMouseLeave={() => setIsCategoryOpen(false)}
                className={`absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 transition-all duration-300 origin-top-left ${
                  isCategoryOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-1 gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg opacity-70">{cat.icon || 'category'}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                  <Link to="/categories-page" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">
                    Lihat Semua Kategori
                  </Link>
                </div>
              </div>
            </div>

            <Link className={`text-sm font-medium transition-colors ${location.pathname === '/about-us' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'}`} to="/about-us">Tentang</Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm w-48 xl:w-64 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                placeholder="Cari produk..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>

            <Link to="/shopping-cart" className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className={`absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold transition-transform ${animateCart ? 'scale-150 ring-4 ring-blue-600/30' : 'scale-100'}`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            {user && (
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
            )}

            <div className="hidden sm:block h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {user ? (
              <div className="hidden sm:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container flex items-center justify-center border-2 border-blue-100 flex-shrink-0 relative">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-blue-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                    {userProfile?.full_name?.split(' ')[0] || 'Akun'}
                  </span>
                  <span className={`material-symbols-outlined text-sm text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 z-50">
                    <div className="px-3 py-2 mb-1 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{userProfile?.full_name || 'Pengguna'}</p>
                      <p className="text-xs text-slate-500 truncate">{userProfile?.email || user.email}</p>
                    </div>
                    <Link
                      to={dashboardLink}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-base">dashboard</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors text-sm mt-1 border-t border-slate-100 dark:border-slate-700"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login-page" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors px-3 py-2">Masuk</Link>
                <Link to="/register-page" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-95">Daftar</Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
              {user && hasUnreadNotification && !isMenuOpen && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[-1] md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-[64px] right-0 h-[calc(100vh-64px)] w-full sm:w-80 bg-white dark:bg-slate-900 shadow-2xl z-40 md:hidden transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } border-l border-slate-100 dark:border-slate-800 overflow-y-auto`}
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Link className="block text-lg font-bold text-slate-800 dark:text-white" to="/">Beranda</Link>
            <Link className="block text-lg font-bold text-slate-800 dark:text-white" to="/shop-catalogue">Toko</Link>

            <div className="space-y-4">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full text-lg font-bold text-slate-800 dark:text-white"
              >
                Kategori
                <span className={`material-symbols-outlined transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              <div className={`grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300 ${isCategoryOpen ? 'max-h-96 py-2' : 'max-h-0'}`}>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center"
                  >
                    <span className="material-symbols-outlined text-blue-600">{cat.icon || 'category'}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link className="block text-lg font-bold text-slate-800 dark:text-white" to="/about-us">Tentang Kami</Link>
            
            {user && (
              <Link 
                className="flex items-center justify-between text-lg font-bold text-slate-800 dark:text-white" 
                to={chatLink}
                onClick={() => { setHasUnreadNotification(false); setIsMenuOpen(false); }}
              >
                Notifikasi
                {hasUnreadNotification && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>}
              </Link>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600/20 outline-none"
                placeholder="Cari produk..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>

            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-blue-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{userProfile?.full_name || 'Pengguna'}</p>
                    <p className="text-xs text-slate-500">{userProfile?.email || user.email}</p>
                  </div>
                </div>
                <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-3 px-4 border border-red-200 text-red-600 rounded-xl text-sm font-bold"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login-page" className="flex items-center justify-center py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Masuk
                </Link>
                <Link to="/register-page" className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
