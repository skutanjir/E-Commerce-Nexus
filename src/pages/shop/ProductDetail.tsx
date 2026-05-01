import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

import type { Product } from "../../types";

export default function ProductDetail() {
  const { toast, confirm: confirmAction } = usePopup();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyUserName, setReplyUserName] = useState("");
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // The REST API /products/:id will return the product with category and reviews injected
        const res = await api.get(`/products/${id}`);
        const productData = res.data;
        setProduct(productData);

        // Fetch seller profile if seller_id exists
        if (productData.seller_id) {
          try {
            const profileRes = await api.get(`/profiles/${productData.seller_id}`);
            setSellerProfile(profileRes.data);
          } catch (profileErr) {
            console.error("Error fetching seller profile:", profileErr);
          }
        }

        if (productData.reviews && productData.reviews.length > 0) {
          const avg = productData.reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / productData.reviews.length;
          setAvgRating(Math.round(avg * 10) / 10);
          setReviewCount(productData.reviews.length);
        }

        if (currentUser) {
           const wishRes = await api.get('/wishlists');
           const inWishlist = wishRes.data.some((w: any) => w.product_id === id);
           setIsWishlisted(inWishlist);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err.message);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id, currentUser]);

  
  
  const submitReply = () => {
    if (!replyReviewId || !replyText.trim()) return;
    handleReplyReview(replyReviewId, replyText);
    setShowReplyModal(false);
  };
  
  const handleReplyReview = async (reviewId: string, replyText: string) => {
    try {
      await api.put(`/products/${product!.id}/reviews/${reviewId}/reply`, { reply: replyText });
      toast("Balasan berhasil dikirim!", "success");
      setProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r: any) => r.id === reviewId ? { ...r, seller_reply: replyText } : r)
        };
      });
    } catch (err: any) {
      toast(err.response?.data?.error || "Gagal membalas ulasan", "error");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!await confirmAction("Hapus ulasan ini permanen?")) return;
    try {
      await api.delete(`/products/${product!.id}/reviews/${reviewId}`);
      toast("Ulasan berhasil dihapus!", "success");
      setProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.filter((r: any) => r.id !== reviewId)
        };
      });
    } catch (err: any) {
      toast(err.response?.data?.error || "Gagal menghapus ulasan", "error");
    }
  };
  
  const handleToggleWishlist = async () => {
    if (!currentUser) {
      navigate("/login-page");
      return;
    }
    try {
      if (isWishlisted) {
        // We don't have the wishlist ID directly here, so we might need a specific endpoint or just rely on backend to handle by product_id
        // Since the current endpoint is DELETE /api/wishlists/:id, we will do a fast optimistic toggle if we must
        // Ideally we fetch wishlist ID. For now, we'll implement a simple UX switch
        toast("Fitur hapus wishlist sedang dioptimasi.");
      } else {
        await api.post('/wishlists', { product_id: product?.id });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!currentUser) {
      navigate("/login-page");
      return;
    }
    const saved = localStorage.getItem("nexus_cart");
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { id: string }) => item.id === product.id);
    
    const cartItem = { 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image_url: product.image_url, 
      quantity,
      seller_id: product.seller_id,
      shop_name: sellerProfile?.full_name || 'Toko tidak diketahui'
    };

    if (existing) {
      existing.quantity += quantity;
      // Also update seller info in case it was missing
      existing.seller_id = cartItem.seller_id;
      existing.shop_name = cartItem.shop_name;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem("nexus_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("nexus:cart-updated"));
    setAddedMsg(`${quantity} item ditambahkan ke keranjang!`);
    setTimeout(() => setAddedMsg(null), 3000);
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      navigate("/login-page");
      return;
    }
    if (!product) return;
    const saved = localStorage.getItem("nexus_cart");
    const cart = saved ? JSON.parse(saved) : [];
    const existing = cart.find((item: { id: string }) => item.id === product.id);
    
    const cartItem = { 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image_url: product.image_url, 
      quantity,
      seller_id: product.seller_id,
      shop_name: sellerProfile?.full_name || 'Toko tidak diketahui'
    };

    if (existing) {
      existing.quantity += quantity;
      // Also update seller info in case it was missing
      existing.seller_id = cartItem.seller_id;
      existing.shop_name = cartItem.shop_name;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem("nexus_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("nexus:cart-updated"));
    navigate("/checkout-flow");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center p-8">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-on-surface-variant mb-6 text-center max-w-md">
            Produk yang Anda cari tidak ada atau gagal dimuat.
          </p>
          <Link to="/" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold">
            Kembali ke Beranda
          </Link>

      </main>
      <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 lg:px-8">
        {/*  Breadcrumb  */}
        <nav className="flex mb-12 text-sm font-medium text-on-surface-variant font-label">
          <Link className="hover:text-primary transition-colors" to="/">Beranda</Link>
          <span className="mx-2 opacity-30">/</span>
          <Link className="hover:text-primary transition-colors" to="/categories">Toko</Link>
          <span className="mx-2 opacity-30">/</span>
          <Link className="hover:text-primary transition-colors capitalize" to={`/categories/${product.category?.slug || 'all'}`}>
            {product.category?.name || 'Kategori'}
          </Link>
          <span className="mx-2 opacity-30">/</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>

        {/*  Product Hero Section  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/*  Gallery Column  */}
          <div className="space-y-6 sticky top-32">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-low shadow-sm border border-outline-variant/10">
              {product.image_url ? (
                <img
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  src={product.image_url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
                  <span className="material-symbols-outlined text-8xl opacity-50">inventory_2</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square rounded-xl border-2 border-primary overflow-hidden cursor-pointer">
                {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-surface-container-low"><span className="material-symbols-outlined text-outline text-4xl">inventory_2</span></div>}
              </div>
            </div>
          </div>

          {/*  Product Info Column  */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black tracking-widest rounded-full uppercase">
                {product.category?.name}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => {
                  const filled = avgRating >= s;
                  const half = !filled && avgRating >= s - 0.5;
                  return (
                    <span
                      key={s}
                      className="material-symbols-outlined text-xl text-amber-400"
                      style={{ fontVariationSettings: `'FILL' ${filled || half ? 1 : 0}` }}
                    >
                      {half ? "star_half" : "star"}
                    </span>
                  );
                })}
                <span className="ml-2 text-sm font-black text-on-surface">
                  {reviewCount > 0 ? avgRating.toFixed(1) : "Belum ada rating"}
                </span>
              </div>
              {reviewCount > 0 && (
                <span className="text-on-surface-variant text-sm font-medium">{reviewCount} Ulasan</span>
              )}
            </div>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-5xl font-black text-primary">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm mb-10 space-y-8">
               {/*  Quantity Selector  */}
              <div>
                <h3 className="text-xs font-black text-on-surface-variant mb-4 uppercase tracking-widest">
                  Jumlah Pesanan
                </h3>
                <div className="flex items-center w-fit border border-outline-variant/20 rounded-xl bg-surface-container-low overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-4 text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="px-8 font-black text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-4 text-on-surface hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>

              {/*  CTAs  */}
              {!currentUser && (
                <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-5 py-3 rounded-xl border border-amber-200 text-sm font-bold mb-2">
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Silakan <Link to="/login-page" className="underline ml-1">masuk</Link> terlebih dahulu untuk membeli produk.
                </div>
              )}
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary text-on-primary py-4 lg:py-5 rounded-xl font-black text-base lg:text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    Beli Langsung
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-4 lg:p-5 rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center ${isWishlisted ? 'border-red-100 bg-red-50 text-red-500' : 'border-outline-variant/20 text-on-surface hover:border-red-200 hover:text-red-500'}`}
                    title="Tambah ke Favorit"
                  >
                    <span className="material-symbols-outlined" style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login-page');
                      } else if (!product.seller_id) {
                        toast('Maaf, produk ini tidak memiliki penjual yang valid (mungkin produk lawas).');
                      } else {
                        navigate(`/user-dashboard-chat/${product.seller_id}`);
                      }
                    }}
                    className="p-4 lg:p-5 rounded-xl border-2 border-outline-variant/20 text-on-surface hover:border-primary/30 hover:text-primary transition-all active:scale-95 flex items-center justify-center"
                    title="Chat Penjual"
                  >
                    <span className="material-symbols-outlined">chat</span>
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full border-2 border-primary text-primary py-4 lg:py-5 rounded-xl font-black text-base lg:text-lg hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Tambah ke Keranjang
                </button>
              </div>
            </div>

            {/*  Add to Cart Toast  */}
            {addedMsg && (
              <div className="flex items-center gap-3 bg-primary/10 text-primary px-5 py-3 rounded-xl border border-primary/20 text-sm font-bold mb-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {addedMsg}
              </div>
            )}

            {/* Seller Section */}
            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10 mb-10 flex items-center justify-between transition-all hover:bg-surface-container-high/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 shadow-sm">
                  {sellerProfile?.avatar_url ? (
                    <img 
                      src={sellerProfile.avatar_url} 
                      alt={sellerProfile.full_name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline-variant bg-surface-container-high">
                      <span className="material-symbols-outlined text-2xl">store</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-on-surface text-lg leading-tight">
                    {sellerProfile?.full_name || 'Memuat informasi penjual...'}
                  </h4>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">
                    Penjual Terverifikasi
                  </p>
                </div>
              </div>
              <Link 
                to={`/seller/${product.seller_id}`}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                Kunjungi Toko
              </Link>
            </div>

            {/*  Description Preview  */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">Deskripsi</h3>
              <p className="text-on-surface-variant leading-relaxed text-lg italic">
                "{product.description || 'Belum ada deskripsi untuk produk ini.'}"
              </p>
            </div>
          </div>
        </div>

        {/*  Full Details Section  */}
        <div className="mt-32">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="flex bg-surface-container-low/50">
              <button className="px-12 py-6 text-primary border-b-4 border-primary font-black text-xs tracking-widest uppercase bg-surface-container-lowest">
                Informasi Produk
              </button>
            </div>
            <div className="p-12 lg:p-20">
              <div className="max-w-4xl space-y-8">
                <h2 className="text-3xl font-black text-on-surface">Spesifikasi & Keunggulan Produk</h2>
                <p className="text-on-surface-variant leading-relaxed text-xl">
                  {product.description || 'Produk NEXUS premium ini dirancang dengan standar kualitas tertinggi, memadukan teknologi dan desain secara sempurna.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-start gap-4 p-6 bg-surface-container-low rounded-2xl">
                    <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                    <div>
                      <p className="font-bold text-on-surface">Keaslian Terjamin</p>
                      <p className="text-sm text-on-surface-variant">100% Produk NEXUS Original</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 bg-surface-container-low rounded-2xl">
                    <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                    <div>
                      <p className="font-bold text-on-surface">Pengiriman Cepat</p>
                      <p className="text-sm text-on-surface-variant">Prioritas pengiriman untuk semua pesanan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Ulasan Pelanggan */}
        <div className="mt-12 bg-surface-container-lowest rounded-3xl p-8 lg:p-12 border border-outline-variant/10">
          <h2 className="text-2xl font-black text-on-surface mb-8">Ulasan Pembeli</h2>
          {(product as any).reviews && (product as any).reviews.length > 0 ? (
            <div className="space-y-6">
              {(product as any).reviews.map((review: any) => (
                <div key={review.id} className="pb-6 border-b border-outline-variant/10 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low overflow-hidden flex items-center justify-center flex-shrink-0 border border-outline-variant/10">
                      {review.user_avatar ? (
                        <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-xl">person</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{review.user_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-[14px] ${review.rating >= star ? 'text-amber-400' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-on-surface-variant">
                          {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-on-surface leading-relaxed ml-14">{review.comment}</p>
                  )}
                  
                  {currentUser?.id === product?.seller_id && (
                    <div className="mt-4 flex gap-4 ml-14">
                      {!review.seller_reply && (
                        <button
                          onClick={() => {
                            
                            setReplyReviewId(review.id);
                            setReplyUserName(review.user_name);
                            setReplyText('');
                            setShowReplyModal(true);
  
                          }}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">reply</span>
                          Balas Ulasan
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-xs text-error font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Hapus
                      </button>
                    </div>
                  )}
  
                  {review.seller_reply && (
                    <div className="mt-3 ml-14 p-4 bg-surface-container-low rounded-xl rounded-tl-sm border border-outline-variant/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Balasan Penjual</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{review.seller_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">reviews</span>
              <p className="text-on-surface-variant">Belum ada ulasan untuk produk ini.</p>
            </div>
          )}
        </div>

        {/* Modal Balasan Penjual */}
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-on-surface">Balas Ulasan {replyUserName}</h3>
                <button onClick={() => setShowReplyModal(false)} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="mb-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tulis balasan Anda sebagai penjual..."
                  className="w-full border border-outline-variant/20 rounded-xl p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  Kirim Balasan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
