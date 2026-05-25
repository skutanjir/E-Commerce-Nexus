import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardNav from '../../components/layout/DashboardNav';

const ALLOWED_IMAGE_DOMAINS = [
  'googleusercontent.com',
  'imgur.com',
  'i.imgur.com',
  'cloudinary.com',
  'res.cloudinary.com',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'pbs.twimg.com',
  'cdn.discordapp.com',
  'i.ibb.co',
  'ibb.co',
];

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) return true; // Allow local avatar serving
    return ALLOWED_IMAGE_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

export default function UserDashboardProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, authLoading, refreshProfile } = useUser();
  const isAdminProfile = location.pathname === '/admin-profile';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url'>('upload');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login-page'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setGender(profile.gender || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const updateData: Record<string, string> = { full_name: fullName };
      if (phone) updateData.phone = phone;
      if (gender) updateData.gender = gender;

      await api.put('/profiles/me', updateData);

      await refreshProfile();
      setSuccessMsg('Profil berhasil disimpan!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSave = async () => {
    setAvatarError('');
    if (!avatarUrl.trim()) { setAvatarError('URL tidak boleh kosong.'); return; }
    if (!isAllowedImageUrl(avatarUrl.trim())) {
      setAvatarError(
        'URL tidak diizinkan. Gunakan link gambar dari sumber yang aman (misalnya: imgur, cloudinary, Google Photos, Unsplash, GitHub Avatar).'
      );
      return;
    }
    try {
      setAvatarSaving(true);
      await api.put('/profiles/me/avatar-url', { avatar_url: avatarUrl.trim() });
      await refreshProfile(); // Panggil ini untuk me-refresh data lokal context
      
      // Mengatasi isu cache image URL
      setAvatarUrl('');
      setShowAvatarModal(false);
      setSuccessMsg('Foto profil berhasil diperbarui!');
    } catch (err: any) {
      setAvatarError(err.response?.data?.error || err.message || 'Gagal menyimpan foto.');
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleAvatarFileUpload = async () => {
    if (!avatarFile || !user) return;
    setAvatarSaving(true);
    setAvatarError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(avatarFile.type)) {
      setAvatarError('Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.');
      setAvatarSaving(false);
      return;
    }

    const isGif = avatarFile.type === 'image/gif';
    const maxSize = isGif ? 2 * 1024 * 1024 : 1 * 1024 * 1024;
    const maxLabel = isGif ? '2MB' : '1MB';
    if (avatarFile.size > maxSize) {
      setAvatarError(`Ukuran file terlalu besar. Maksimal ${maxLabel} untuk ${isGif ? 'GIF' : 'gambar'}.`);
      setAvatarSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      await api.post('/profiles/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await refreshProfile(); // Panggil ini untuk me-refresh data lokal context
      
      setShowAvatarModal(false);
      setAvatarFile(null);
      setSuccessMsg('Foto profil berhasil diperbarui!');
      
      // Paksa reload halaman agar gambar yang memiliki nama file cache lama diperbarui
      window.location.reload();
    } catch (err: any) {
      setAvatarError(err.response?.data?.error || err.message || 'Gagal upload foto.');
    } finally {
      setAvatarSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    if (newPassword.length < 8) { setPasswordMsg('Password minimal 8 karakter.'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('Password tidak cocok.'); return; }
    try {
      setPasswordSaving(true);
      await api.put('/profiles/me/password', { newPassword });
      setPasswordMsg('✓ Password berhasil diubah!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setShowPasswordForm(false); setPasswordMsg(''); }, 2000);
    } catch (err: any) {
      setPasswordMsg(err.response?.data?.error || err.message || 'Gagal mengubah password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-container-lowest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getAvatarSrc = (url: string | undefined | null) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <>
      {!isAdminProfile && <DashboardNav profile={profile} />}

      <main className={isAdminProfile ? 'max-w-[1600px] mx-auto' : 'pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen'}>
        <div className={isAdminProfile ? '' : 'grid grid-cols-1 md:grid-cols-12 gap-8'}>
          {!isAdminProfile && <DashboardSidebar profile={profile} />}

          <div className={isAdminProfile ? '' : 'md:col-span-9'}>
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Profil</h1>
              <p className="text-on-surface-variant mt-2">Kelola informasi akun Anda.</p>
            </header>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
              <form onSubmit={handleSave} className="p-8 space-y-10">
                {/* Avatar Section */}
                <div className="flex items-center gap-8 pb-10 border-b border-outline-variant/10">
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <img src={getAvatarSrc(profile.avatar_url)} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-high shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface-container-high">
                        <span className="material-symbols-outlined text-4xl text-primary">person</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-on-surface mb-1">Foto Profil</h3>
                    <p className="text-sm text-on-surface-variant mb-4">Ganti foto profil dengan upload file atau link URL.</p>
                    <button
                      type="button"
                      onClick={() => { setShowAvatarModal(true); setAvatarUrl(profile?.avatar_url || ''); setAvatarError(''); }}
                      className="px-4 py-2 bg-surface-container-low text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Ganti Foto
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="full_name">Nama Lengkap</label>
                    <input
                      id="full_name"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg py-3 px-4 text-on-surface-variant cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="phone">Nomor Telepon</label>
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
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="gender">Jenis Kelamin</label>
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
                    onClick={() => { setFullName(profile?.full_name || ''); setPhone(profile?.phone || ''); setGender(profile?.gender || ''); setSuccessMsg(''); setErrorMsg(''); }}
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

            {/* Password Change */}
            <div className="mt-8">
                <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface">Password</h4>
                    <p className="text-sm text-on-surface-variant">Ubah password akun Anda</p>
                  </div>
                  <button
                    onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordMsg(''); }}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    {showPasswordForm ? 'Batal' : 'Ubah'}
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="mt-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password Baru</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min. 8 karakter"
                          className="w-full border border-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Konfirmasi Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password"
                          className="w-full border border-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface text-sm"
                        />
                      </div>
                    </div>
                    {passwordMsg && (
                      <p className={`text-sm ${passwordMsg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}`}>{passwordMsg}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-60 text-sm"
                      >
                        {passwordSaving ? 'Menyimpan...' : 'Simpan Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
          </div>
        </div>
      </main>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Ganti Foto Profil</h3>
              <button onClick={() => { setShowAvatarModal(false); setAvatarFile(null); }} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant/20 mb-6">
              <button
                onClick={() => setAvatarMode('upload')}
                className={`flex-1 py-2 text-sm font-bold transition-all ${avatarMode === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
              >
                Upload File
              </button>
              <button
                onClick={() => setAvatarMode('url')}
                className={`flex-1 py-2 text-sm font-bold transition-all ${avatarMode === 'url' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'}`}
              >
                Dari URL
              </button>
            </div>

            <div className="mb-6 flex justify-center">
              {avatarMode === 'upload' ? (
                avatarFile ? (
                  <img
                    src={URL.createObjectURL(avatarFile)}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-high shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface-container-high">
                    <span className="material-symbols-outlined text-4xl text-primary">upload</span>
                  </div>
                )
              ) : (
                avatarUrl && isAllowedImageUrl(avatarUrl) ? (
                  <img
                    src={getAvatarSrc(avatarUrl)}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-high shadow"
                    onError={() => setAvatarError('Gambar tidak dapat dimuat. Periksa URL Anda.')}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface-container-high">
                    <span className="material-symbols-outlined text-4xl text-primary">person</span>
                  </div>
                )
              )}
            </div>

            {avatarMode === 'upload' ? (
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pilih File Gambar</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarError('');
                    }
                  }}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Format & Ukuran yang Didukung:</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 leading-tight mt-0.5">JPG, PNG, WebP — maks. <strong>1MB</strong> &nbsp;|&nbsp; GIF — maks. <strong>2MB</strong></p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">URL Foto</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => { setAvatarUrl(e.target.value); setAvatarError(''); }}
                  placeholder="https://i.imgur.com/..."
                  className="w-full border border-outline-variant/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-on-surface"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Domain yang diizinkan:</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 text-[10px] leading-tight">
                    Imgur, Cloudinary, Google Photos, Unsplash, GitHub, Twitter, Discord, ImgBB, atau domain Nexus Lokal Anda
                  </p>
                </div>
              </div>
            )}

            {avatarError && (
              <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">
                <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error</span>
                {avatarError}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setShowAvatarModal(false); setAvatarFile(null); }} className="flex-1 px-4 py-2.5 text-on-surface-variant font-semibold border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors text-sm">
                Batal
              </button>
              <button
                onClick={avatarMode === 'upload' ? handleAvatarFileUpload : handleAvatarSave}
                disabled={avatarSaving || (avatarMode === 'url' ? !avatarUrl.trim() : !avatarFile)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-60 text-sm"
              >
                {avatarSaving ? 'Menyimpan...' : 'Simpan Foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
