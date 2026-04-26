import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, Product, Category } from '../../types';
import SellerSidebar from '../../components/layout/SellerSidebar';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category_id: '', image_url: '' };

export default function AdminProductManagement() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login-page'); return; }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData?.role !== 'seller') { navigate('/user-dashboard'); return; }
        setProfile(profileData as Profile);

        const [{ data: prodData }, { data: catData }] = await Promise.all([
          supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('name'),
        ]);

        if (prodData) setProducts(prodData as Product[]);
        if (catData) setCategories(catData as Category[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock), category_id: p.category_id || '', image_url: p.image_url || '' });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    try {
      setSaving(true);
      const payload = { name: form.name, description: form.description, price: Number(form.price), stock: Number(form.stock), category_id: form.category_id || null, image_url: form.image_url || null };
      if (editId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editId);
        if (!error) setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p));
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('*, category:categories(name)').single();
        if (!error && data) setProducts(prev => [data as Product, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SellerSidebar profile={profile} />

      <main className="flex-1 ml-72 bg-surface-container-lowest p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Manajemen Produk</h1>
            <p className="text-on-surface-variant mt-1 text-sm">Kelola inventori, harga, dan listing produk.</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Produk
          </button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Produk', value: totalProducts, icon: 'inventory_2', color: 'blue' },
            { label: 'Stok Rendah', value: lowStock, icon: 'warning', color: 'orange' },
            { label: 'Habis Stok', value: outOfStock, icon: 'remove_shopping_cart', color: 'red' },
            { label: 'Kategori', value: categories.length, icon: 'category', color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container-low p-5 rounded-xl shadow-sm">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-on-surface mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-on-surface mb-4">{editId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Nama Produk', type: 'text', placeholder: 'Nama produk' },
                { key: 'price', label: 'Harga (Rp)', type: 'number', placeholder: '0' },
                { key: 'stock', label: 'Stok', type: 'number', placeholder: '0' },
                { key: 'image_url', label: 'URL Gambar', type: 'text', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full border border-outline-variant/20 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-on-surface"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Kategori</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full border border-outline-variant/20 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-on-surface appearance-none"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Deskripsi produk..."
                  className="w-full border border-outline-variant/20 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-on-surface resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-on-surface-variant font-semibold text-sm hover:text-on-surface">Batal</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-md active:scale-95 transition-all disabled:opacity-60 text-sm"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari produk atau kategori..."
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>
            <p className="text-xs text-on-surface-variant flex-shrink-0">{filteredProducts.length} produk</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface/50">
                <tr>
                  {['Produk', 'Kategori', 'Harga', 'Stok', 'Aksi'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-on-surface-variant">
                      {search ? 'Tidak ada produk yang cocok.' : 'Belum ada produk.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-surface/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-on-surface-variant">image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-sm leading-tight">{product.name}</p>
                            <p className="text-[11px] text-on-surface-variant">ID: {product.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {product.category?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">
                        Rp {product.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock <= 10 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                          <span className="font-semibold">{product.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
