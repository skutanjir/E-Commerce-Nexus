import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { usePopup } from "../../contexts/PopupContext";
import type { Product } from "../../types";

interface Promo {
  id: string;
  name: string;
  discount: number;
  start: string;
  end: string;
  products: string[];
}

export default function AdminDiscounts() {
  const { toast, confirm: confirmAction } = usePopup();
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", discount: "", start: "", end: "", products: [] as string[] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get('/products');
        if (data) setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const saved = localStorage.getItem("nexus_promos");
    if (saved) setPromos(JSON.parse(saved));
    load();
  }, []);

  const savePromos = (list: Promo[]) => {
    setPromos(list);
    localStorage.setItem("nexus_promos", JSON.stringify(list));
  };

  const handleCreate = () => {
    if (!form.name || !form.discount || !form.start || !form.end) return;
    setSaving(true);
    const promo: Promo = {
      id: Date.now().toString(),
      name: form.name,
      discount: Number(form.discount),
      start: form.start,
      end: form.end,
      products: form.products,
    };
    savePromos([promo, ...promos]);
      setForm({ name: "", discount: "", start: "", end: "", products: [] });
      setShowForm(false);
      setSaving(false);
      toast('Promo berhasil dibuat.', 'success');
  };

  const deletePromo = async (id: string) => {
    if (!(await confirmAction('Hapus promo ini?'))) return;
    savePromos(promos.filter(p => p.id !== id));
    toast('Promo berhasil dihapus.', 'success');
  };

  const toggleProduct = (id: string) => {
    setForm(f => ({
      ...f,
      products: f.products.includes(id) ? f.products.filter(p => p !== id) : [...f.products, id],
    }));
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
      {/* Header */}
      <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Diskon & Promo</h1>
            <p className="text-on-surface-variant text-sm mt-1">Buat dan kelola kampanye diskon untuk produk Anda.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Buat Promo Baru
          </button>
        </header>

        {/* Promo Banner Preview */}
        <div className="mb-8 h-40 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary-container"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-6">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">MEGA SALE 11.11</h2>
            <p className="text-sm mt-1 opacity-90">Dapatkan diskon hingga 90% untuk seluruh koleksi. Hanya tersedia selama persediaan masih ada.</p>
          </div>
        </div>

        {/* Create Promo Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl p-8 mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-on-surface">Buat Promo Baru</h2>
                <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Nama Promo</label>
                  <input
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="e.g. MEGA SALE 11.11"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Persentase Diskon (%)</label>
                  <input
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    placeholder="e.g. 50"
                    type="number"
                    min="1"
                    max="90"
                    value={form.discount}
                    onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Mulai</label>
                    <input
                      className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      type="date"
                      value={form.start}
                      onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Selesai</label>
                    <input
                      className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      type="date"
                      value={form.end}
                      onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Pilih Produk</label>
                  <p className="text-xs text-on-surface-variant mb-3">Kosongkan untuk terapkan ke semua produk.</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-outline-variant/20 rounded-lg p-3 bg-surface-container-low/30">
                    {products.map(p => (
                      <label key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={form.products.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm font-medium text-on-surface">{p.name}</span>
                        <span className="ml-auto text-xs font-bold text-primary">Rp {Number(p.price).toLocaleString('id-ID')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-outline-variant/30 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Promo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promo List */}
        {promos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container-low/30 rounded-2xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">local_offer</span>
            <h3 className="text-lg font-bold text-on-surface mb-1">Belum Ada Promo</h3>
            <p className="text-sm text-on-surface-variant">Buat kampanye diskon pertama Anda untuk menarik lebih banyak pembeli.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promos.map(promo => {
              const now = new Date();
              const end = new Date(promo.end);
              const start = new Date(promo.start);
              const isActive = now >= start && now <= end;
              const isExpired = now > end;

              return (
                <div key={promo.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-6 flex items-center gap-6">
                  <div className={`w-2 h-14 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : isExpired ? 'bg-error/40' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-lg text-on-surface">{promo.name}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        isActive ? 'bg-emerald-100 text-emerald-700' :
                        isExpired ? 'bg-error/10 text-error' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {isActive ? 'Aktif' : isExpired ? 'Berakhir' : 'Terjadwal'}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {promo.start} — {promo.end} &nbsp;·&nbsp;
                      {promo.products.length === 0 ? 'Semua produk' : `${promo.products.length} produk dipilih`}
                    </p>
                  </div>
                  <div className="text-center px-6 border-l border-r border-outline-variant/10">
                    <p className="text-4xl font-black text-primary">{promo.discount}%</p>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-1">Diskon</p>
                  </div>
                  <button
                    onClick={() => deletePromo(promo.id)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
