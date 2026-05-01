import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Category } from '../../types';

const EMPTY_FORM = { name: '', slug: '', icon: '', description: '' };

export default function AdminCategoryManagement() {
  const { toast, confirm: confirmAction } = usePopup();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await api.get('/categories');
        if (data) setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', description: cat.description || '' });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      setSaving(true);
      const payload = { name: form.name, slug: form.slug || toSlug(form.name), icon: form.icon || undefined, description: form.description || undefined };
      if (editId) {
        const { data } = await api.put(`/categories/${editId}`, payload);
        if (data) setCategories(prev => prev.map(c => c.id === editId ? data : c));
      } else {
        const { data } = await api.post('/categories', payload);
        if (data) setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Hapus kategori ini? Produk terkait mungkin terpengaruh.'))) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Manajemen Kategori</h1>
            <p className="text-on-surface-variant mt-1 text-sm">Kelola kategori produk toko Anda.</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Kategori
          </button>
        </header>

        {showForm && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-on-surface mb-4">{editId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Nama Kategori', placeholder: 'Elektronik' },
                { key: 'slug', label: 'Slug URL', placeholder: 'elektronik (auto dari nama)' },
                { key: 'icon', label: 'Icon (Material Symbols)', placeholder: 'devices' },
                { key: 'description', label: 'Deskripsi', placeholder: 'Deskripsi singkat kategori' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={form[field.key as keyof typeof form]}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        [field.key]: val,
                        ...(field.key === 'name' && !prev.slug ? { slug: toSlug(val) } : {}),
                      }));
                    }}
                    placeholder={field.placeholder}
                    className="w-full border border-outline-variant/20 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-on-surface"
                  />
                </div>
              ))}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">category</span>
              <p>Belum ada kategori.</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="bg-surface-container-low p-5 rounded-xl shadow-sm border border-outline-variant/10 group hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-on-surface mb-1">{cat.name}</h3>
                <p className="text-xs text-on-surface-variant font-mono">/{cat.slug}</p>
                {cat.description && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{cat.description}</p>}
              </div>
            ))
          )}
        </div>
      </div>
  );
}
