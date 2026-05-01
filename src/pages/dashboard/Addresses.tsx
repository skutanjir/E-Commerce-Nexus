import { usePopup } from '../../contexts/PopupContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import type { Address } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardNav from '../../components/layout/DashboardNav';

const EMPTY_FORM = { label: '', full_name: '', phone: '', address_line: '', city: '', province: '', postal_code: '' };

export default function UserDashboardAddresses() {
  const { toast, confirm: confirmAction } = usePopup();
  const navigate = useNavigate();
  const { user, profile, authLoading } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login-page'); return; }

    async function fetchAddresses() {
      try {
        setLoading(true);
        const { data } = await api.get('/addresses');
        if (data) setAddresses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAddresses();
  }, [user, authLoading, navigate]);

  const openAddForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEditForm = (address: Address) => {
    setForm({ label: address.label, full_name: address.full_name, phone: address.phone, address_line: address.address_line, city: address.city || '', province: address.province || '', postal_code: address.postal_code || '' });
    setEditId(address.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.label || !form.full_name || !form.address_line) return;
    try {
      setSaving(true);
      if (editId) {
        const { data } = await api.put(`/addresses/${editId}`, form);
        setAddresses(prev => prev.map(a => a.id === editId ? data : a));
      } else {
        const { data } = await api.post('/addresses', form);
        setAddresses(prev => [data, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction('Hapus alamat ini?'))) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Gagal menghapus alamat", error);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await api.put(`/addresses/${id}/default`);
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
    } catch (error) {
      console.error("Gagal mengubah alamat default", error);
    }
  };

  return (
    <>
      <DashboardNav profile={profile} />

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <DashboardSidebar profile={profile} />

          <div className="md:col-span-9">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Daftar Alamat</h1>
                <p className="text-on-surface-variant mt-1 text-sm">Kelola alamat pengiriman belanja Anda</p>
              </div>
              <button
                onClick={openAddForm}
                className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tambah Alamat
              </button>
            </div>

            {showForm && (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-on-surface mb-4">{editId ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'label', label: 'Label (cth: Rumah, Kantor)', placeholder: 'Rumah' },
                    { key: 'full_name', label: 'Nama Penerima', placeholder: 'Nama lengkap' },
                    { key: 'phone', label: 'Nomor Telepon', placeholder: '08xx xxxx xxxx' },
                    { key: 'address_line', label: 'Alamat Lengkap', placeholder: 'Jl. contoh No. 1' },
                    { key: 'city', label: 'Kota', placeholder: 'Jakarta' },
                    { key: 'province', label: 'Provinsi', placeholder: 'DKI Jakarta' },
                    { key: 'postal_code', label: 'Kode Pos', placeholder: '12345' },
                  ].map(field => (
                    <div key={field.key} className={field.key === 'address_line' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full border border-outline-variant/20 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-on-surface"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-on-surface-variant font-semibold hover:text-on-surface text-sm">Batal</button>
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

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-40 bg-surface-container-low animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-16 bg-surface-container-lowest rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">location_off</span>
                    <p className="text-on-surface-variant mb-4">Belum ada alamat tersimpan.</p>
                    <button onClick={openAddForm} className="text-primary font-bold hover:underline">
                      Tambah alamat sekarang
                    </button>
                  </div>
                ) : (
                  addresses.map(address => (
                    <div
                      key={address.id}
                      className={`bg-surface-container-lowest p-6 rounded-xl group transition-all hover:shadow-lg ${address.is_default ? 'border-2 border-primary/20' : 'border border-outline-variant/20'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {address.is_default && (
                            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-fixed px-2 py-1 rounded">Utama</span>
                          )}
                          <h3 className="font-bold text-on-surface">{address.label}</h3>
                        </div>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditForm(address)} className="text-xs font-semibold text-primary hover:underline">Ubah</button>
                          <span className="text-outline-variant">|</span>
                          <button onClick={() => handleDelete(address.id)} className="text-xs font-semibold text-error hover:underline">Hapus</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{address.full_name}</p>
                          <p className="text-sm text-on-surface-variant">{address.phone}</p>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {address.address_line}
                          {address.city && `, ${address.city}`}
                          {address.province && `, ${address.province}`}
                          {address.postal_code && ` ${address.postal_code}`}
                        </p>
                      </div>
                      {!address.is_default && (
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => setDefault(address.id)} className="text-xs font-bold text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded hover:bg-surface-container transition-colors">
                            Jadikan Default
                          </button>
                        </div>
                      )}
                      {address.is_default && (
                        <div className="mt-4 flex justify-end">
                          <span className="text-xs flex items-center gap-1 text-primary font-medium">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            Alamat Pengiriman Utama
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
