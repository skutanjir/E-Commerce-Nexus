import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import type { WishlistItem } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardNav from '../../components/layout/DashboardNav';

export default function UserDashboardWishlist() {
  const navigate = useNavigate();
  const { user, profile, authLoading } = useUser();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login-page'); return; }

    async function fetchWishlist() {
      try {
        setLoading(true);
        const { data } = await api.get('/wishlists');
        if (data) setWishlistItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [user, authLoading, navigate]);

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      await api.delete(`/wishlists/${wishlistId}`);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product: WishlistItem['product']) => {
    if (!product) return;
    const saved = localStorage.getItem('nexus_cart');
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { product_id: string }) => item.product_id === product.id);
    if (existing) { existing.quantity += 1; } else { cart.push({ product_id: product.id, quantity: 1, product }); }
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('nexus:cart-updated'));
  };

  return (
    <>
      <DashboardNav profile={profile} />

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

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-[3/4] bg-surface-container-low animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container-lowest rounded-2xl">
                <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-slate-300">heart_broken</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-on-surface">Wishlist Masih Kosong</h3>
                <p className="text-on-surface-variant mb-8 max-w-sm">
                  Jelajahi produk kami dan simpan produk favorit di sini.
                </p>
                <Link to="/shop-catalogue" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-all">
                  Mulai Belanja
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map(item => {
                  const product = item.product as any;
                  const isArchived = product?.is_archived === true;
                  const outOfStock = product && product.stock === 0;
                  const unavailable = outOfStock || isArchived;
                  
                  return (
                    <div
                      key={item.id}
                      className={`group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative ${unavailable ? 'opacity-70' : ''}`}
                    >
                      {isArchived ? (
                        <div className="absolute top-3 left-3 z-10 bg-red-900/80 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          Produk Dihapus
                        </div>
                      ) : outOfStock ? (
                        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          Stok Habis
                        </div>
                      ) : null}

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm"
                        title="Hapus dari wishlist"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </button>

                      {isArchived ? (
                        <div className="aspect-square bg-surface-variant overflow-hidden grayscale">
                          {product?.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link to={product ? `/product/${product.id}` : '#'}>
                          <div className={`aspect-square bg-surface-variant overflow-hidden ${outOfStock ? 'grayscale' : ''}`}>
                            {product?.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )}

                      <div className="p-5">
                        <p className="text-xs text-on-surface-variant mb-1">{product?.category?.name || 'Kategori'}</p>
                        <h3 className={`font-bold leading-tight mb-1 truncate ${isArchived ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                          {product?.name || 'Produk'}
                        </h3>
                        <div className="flex items-center justify-between mt-3">
                          <p className={`text-lg font-black ${isArchived ? 'text-slate-400' : 'text-blue-600'}`}>
                            Rp {Number(product?.price || 0).toLocaleString('id-ID')}
                          </p>
                          <button
                            onClick={() => product && !unavailable && addToCart(product)}
                            disabled={unavailable}
                            className={`p-2 rounded-lg transition-colors ${unavailable ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-blue-50 text-blue-600'}`}
                            title={isArchived ? "Produk tidak tersedia" : "Tambah ke keranjang"}
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
