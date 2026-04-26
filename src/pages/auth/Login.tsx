import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Fetch profile to check role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.role === "seller") {
          navigate("/admin-dashboard-overview");
        } else {
          navigate("/user-dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/user-dashboard"
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Could not connect to Google");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface to-surface-container-low">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-black tracking-tighter text-primary">
              NEXUS
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_rgba(20,27,43,0.06)] overflow-hidden">
            <div className="pt-10 px-8 pb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-on-surface-variant body-md">
                Silakan masuk ke akun NEXUS Anda.
              </p>
            </div>

            {error && (
              <div className="px-8 mb-4">
                <div className="p-3 bg-error/10 text-error rounded-lg text-sm font-medium">
                  {error}
                </div>
              </div>
            )}

            <form className="px-8 pb-10 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/60 text-on-surface"
                    id="email"
                    name="email"
                    placeholder="nama@email.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-on-surface" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      lock
                    </span>
                  </div>
                  <input
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/60 text-on-surface"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      className="peer h-4 w-4 rounded border-outline-variant/30 text-primary focus:ring-primary transition-all"
                      type="checkbox"
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Ingat Saya
                  </span>
                </label>
                <Link
                  className="text-sm font-semibold text-primary hover:text-surface-tint transition-colors"
                  to="#"
                >
                  Lupa Password?
                </Link>
              </div>

              <button
                className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Masuk..." : "Masuk"}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface-container-lowest px-4 text-outline font-medium">
                    atau masuk dengan
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="w-14 h-14 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest rounded-full hover:bg-surface-container-low transition-all active:scale-[0.98] hover:shadow-sm"
                  type="button"
                  title="Google Login"
                  onClick={handleGoogleLogin}
                >
                  <img
                    alt="Google"
                    className="w-6 h-6"
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  />
                </button>
              </div>
            </form>

            {/*  Footer Link  */}
            <div className="bg-surface-container-low py-6 text-center">
              <p className="text-sm text-on-surface-variant">
                Belum punya akun?
                <Link
                  className="font-bold text-primary hover:underline ml-1"
                  to="/register-page"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>

          {/*  Trust Badges  */}
          <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Login Aman
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">encrypted</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                SSL Terenkripsi
              </span>
            </div>
          </div>
        </div>
      </main>

      {/*  Background Decoration  */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary-container/5 rounded-full blur-[120px]"></div>
      </div>
    </>
  );
}
