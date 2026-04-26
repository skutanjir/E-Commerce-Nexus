import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, WishlistItem } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export default function UserDashboardWishlist() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login-page'); return; }

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData as Profile);

        const { data: wishlistData } = await supabase
          .from('wishlists')
          .select(`
            *,
            product:products (
              id, name, price, image_url, stock,
              category:categories (name)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (wishlistData) setWishlistItems(wishlistData as unknown as WishlistItem[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const removeFromWishlist = async (wishlistId: string) => {
    const { error } = await supabase.from('wishlists').delete().eq('id', wishlistId);
    if (!error) {
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
    }
  };

  const addToCart = (product: WishlistItem['product']) => {
    if (!product) return;
    const saved = localStorage.getItem('nexus_cart');
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { product_id: string }) => item.product_id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ product_id: product.id, quantity: 1, product });
    }
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('nexus:cart-updated'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200/10 shadow-sm">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500">NEXUS</Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/">Beranda</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/shop-catalogue">Toko</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors" to="/categories">Kategori</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/shopping-cart" className="material-symbols-outlined text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors p-2">shopping_cart</Link>
            <div className="h-8 w-8 rounded-full overflow-hidden bg-primary-container flex items-center justify-center border-2 border-white flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <DashboardSidebar profile={profile} />

          <div className="md:col-span-9">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold text-on-surface tracking-tighter">
                  Wishlist Saya {wishlistItems.length > 0 && `(${wishlistItems.length} Produk)`}
                </h1>
                <p className="text-on-surface-variant mt-2">Kumpulan produk impian Anda.</p>
              </div>
            </header>

            {wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container-lowest rounded-2xl">
                <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-300">heart_broken</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-on-surface">Wishlist Anda Masih Kosong</h3>
                <p className="text-on-surface-variant mb-8 max-w-sm">
                  Jelajahi produk kami dan simpan produk favorit Anda di sini.
                </p>
                <Link to="/shop-catalogue" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-all">
                  Mulai Belanja
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map(item => {
                  const product = item.product;
                  const outOfStock = product && product.stock === 0;
                  return (
                    <div
                      key={item.id}
                      className={`group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative ${outOfStock ? 'opacity-70' : ''}`}
                    >
                      {outOfStock && (
                        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          Stok Habis
                        </div>
                      )}
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm"
                        title="Hapus dari wishlist"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </button>

                      <Link to={product ? `/product/${product.id}` : '#'}>
                        <div className={`aspect-square bg-surface-variant overflow-hidden ${outOfStock ? 'grayscale' : ''}`}>
                          {product?.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-5">
                        <p className="text-xs text-on-surface-variant mb-1">{product?.category?.name}</p>
                        <h3 className="font-bold text-on-surface leading-tight mb-1 truncate">
                          {product?.name || 'Produk'}
                        </h3>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-black text-blue-600">
                            Rp {product?.price?.toLocaleString('id-ID') || '0'}
                          </p>
                          <button
                            onClick={() => product && !outOfStock && addToCart(product)}
                            disabled={outOfStock}
                            className={`p-2 rounded-lg transition-colors ${
                              outOfStock
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-50 hover:bg-blue-50 text-blue-600'
                            }`}
                            title="Tambah ke keranjang"
                          >
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
