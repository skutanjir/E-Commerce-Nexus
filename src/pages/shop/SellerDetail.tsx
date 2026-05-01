import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { api } from "../../lib/api";
import type { Product, Profile } from "../../types";

export default function SellerDetail() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; 

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };


  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch seller profile
        const profileRes = await api.get(`/profiles/${id}`);
        setSeller(profileRes.data);

        // Fetch all products and filter by seller_id
        const productsRes = await api.get('/products');
        const sellerProducts = productsRes.data.filter((p: Product) => p.seller_id === id);
        setProducts(sellerProducts);
      } catch (err: any) {
        console.error("Error fetching seller details:", err);
        setError("Gagal memuat profil penjual.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center p-8">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Penjual Tidak Ditemukan</h2>
          <p className="text-on-surface-variant mb-6 text-center max-w-md">
            {error || "Profil penjual tidak tersedia."}
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
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen">
        {/* Seller Banner */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-12 border border-outline-variant/10 shadow-sm mb-12 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-4 border-surface shadow-lg flex-shrink-0">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt={seller.full_name || 'Penjual'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline-variant bg-surface-container-low">
                <span className="material-symbols-outlined text-5xl">store</span>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl font-black text-on-surface mb-2">{seller.full_name || 'Penjual Nexus'}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-on-surface-variant mb-4">
              <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Penjual Terverifikasi
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                {products.length} Produk
              </span>
            </div>
            <p className="text-on-surface-variant max-w-2xl">
              Selamat datang di toko resmi {seller.full_name || 'kami'}. Temukan berbagai macam produk berkualitas dengan harga terbaik hanya di sini.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <h2 className="text-2xl font-black text-on-surface mb-8 border-b border-outline-variant/20 pb-4">
          Semua Produk ({products.length})
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">inventory</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Belum ada produk</h3>
            <p className="text-on-surface-variant">Penjual ini belum menambahkan produk apa pun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map(product => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square bg-surface-container-low overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline-variant">
                      <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-on-surface text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                      {product.category?.name || 'Kategori'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
                    <span className="font-black text-primary text-lg">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'border border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
