import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, Address } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

const EMPTY_FORM = { label: '', full_name: '', phone: '', address_line: '', city: '', province: '', postal_code: '' };

export default function UserDashboardAddresses() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
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

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData as Profile);

        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (addressData) setAddresses(addressData as Address[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (address: Address) => {
    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city || '',
      province: address.province || '',
      postal_code: address.postal_code || '',
    });
    setEditId(address.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.label || !form.full_name || !form.address_line) return;
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editId) {
        const { error } = await supabase.from('addresses').update(form).eq('id', editId);
        if (!error) {
          setAddresses(prev => prev.map(a => a.id === editId ? { ...a, ...form } : a));
        }
      } else {
        const { data, error } = await supabase
          .from('addresses')
          .insert({ ...form, user_id: user.id, is_default: addresses.length === 0 })
          .select()
          .single();
        if (!error && data) setAddresses(prev => [...prev, data as Address]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
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
                      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                        {field.label}
                      </label>
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
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 text-on-surface-variant font-semibold hover:text-on-surface text-sm"
                  >
                    Batal
                  </button>
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
                    className={`bg-surface-container-lowest p-6 rounded-xl group transition-all hover:shadow-lg ${
                      address.is_default ? 'border-2 border-primary/20' : 'border border-outline-variant/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {address.is_default && (
                          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-fixed px-2 py-1 rounded">
                            Utama
                          </span>
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
                        <button
                          onClick={() => setDefault(address.id)}
                          className="text-xs font-bold text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded hover:bg-surface-container transition-colors"
                        >
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
          </div>
        </div>
      </main>
    </>
  );
}
