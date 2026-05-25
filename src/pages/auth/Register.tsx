import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api, setAccessToken } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useUser();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      });

      // Registrasi berhasil, redirect ke halaman login
      navigate('/login-page');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface to-surface-container-low">
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_rgba(20,27,43,0.05)] overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="mb-10 text-center">
              <Link to="/" className="text-3xl font-black tracking-tighter text-primary mb-2 inline-block">
                NEXUS
              </Link>
              <p className="text-on-surface-variant body-md">
                Bergabunglah dengan komunitas belanja pilihan kami.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 text-error rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Nama Lengkap</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    person
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                    placeholder="Masukkan nama lengkap Anda"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Email</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                      placeholder="nama@email.com"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Nomor HP</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      smartphone
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                      placeholder="0812..."
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Role</label>
                <div className="flex p-1 bg-surface-container-low rounded-lg w-full max-w-[380px]">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      formData.role === "user"
                        ? "bg-surface-container-lowest text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "user" })}
                  >
                    Member
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      formData.role === "seller"
                        ? "bg-surface-container-lowest text-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "seller" })}
                  >
                    Seller
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Kata Sandi</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      lock
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                      placeholder="••••••••"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Konfirmasi Kata Sandi</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      verified_user
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                      placeholder="••••••••"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 mt-4 disabled:opacity-50 disabled:active:scale-100"
                type="submit"
                disabled={loading}
              >
                {loading ? "Membuat Akun..." : "Buat Akun"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant text-sm">
                Sudah punya akun?
                <Link
                  className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1"
                  to="/login-page"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary-container/5 rounded-full blur-[120px]"></div>
      </div>
    </>
  );
}
