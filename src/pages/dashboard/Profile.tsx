import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export default function UserDashboardProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login-page'); return; }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
          setFullName(profileData.full_name || '');
          setPhone(profileData.phone || '');
          setGender(profileData.gender || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: Record<string, string> = { full_name: fullName };
      if (phone) updateData.phone = phone;
      if (gender) updateData.gender = gender;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      setSuccessMsg('Profil berhasil disimpan!');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
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
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Profil</h1>
              <p className="text-on-surface-variant mt-2">Kelola informasi akun Anda.</p>
            </header>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
              <form onSubmit={handleSave} className="p-8 space-y-10">
                <div className="flex items-center gap-8 pb-10 border-b border-outline-variant/10">
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-high shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface-container-high">
                        <span className="material-symbols-outlined text-4xl text-primary">person</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-on-surface mb-1">Foto Profil</h3>
                    <p className="text-sm text-on-surface-variant mb-4">Ukuran yang disarankan 200x200px. JPG atau PNG.</p>
                    <button type="button" className="px-4 py-2 bg-surface-container-low text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
                      Ganti Foto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="full_name">
                      Nama Lengkap
                    </label>
                    <input
                      id="full_name"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg py-3 px-4 text-on-surface-variant cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="phone">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">+62</span>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="8xx xxxx xxxx"
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="gender">
                      Jenis Kelamin
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface appearance-none"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>

                {successMsg && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errorMsg}
                  </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => { setFullName(profile?.full_name || ''); setSuccessMsg(''); setErrorMsg(''); }}
                    className="px-6 py-3 text-on-surface-variant font-semibold hover:text-on-surface transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Password</h4>
                  <p className="text-sm text-on-surface-variant">Ubah password akun Anda</p>
                </div>
                <button className="ml-auto text-primary font-bold text-sm hover:underline">Ubah</button>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Verifikasi 2 Langkah</h4>
                  <p className="text-sm text-on-surface-variant">Belum diaktifkan</p>
                </div>
                <button className="ml-auto text-primary font-bold text-sm hover:underline">Aktifkan</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
