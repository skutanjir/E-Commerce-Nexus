import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, setAccessToken, clearAccessToken } from '../lib/api';
import type { AuthUser, Profile } from '../types';

interface UserContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  authLoading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  profile: null,
  authLoading: true,
  refreshProfile: async () => {},
  logout: async () => {},
});

export { UserContext };

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadMe = async () => {
    try {
      const res = await api.get('/auth/me');
      const { user: u, profile: p } = res.data;
      setUser(u);
      setProfile(p);
    } catch {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    await loadMe();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearAccessToken();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        // Karena endpoint /auth/me menggunakan optionalAuthenticate (return 200 tanpa error),
        // interceptor 401 tidak akan terpanggil otomatis saat loadMe() dijalankan tanpa token.
        // Maka kita paksa call /auth/refresh di awal mount untuk memancing cookie 7 hari.
        const res = await api.post('/auth/refresh');
        if (res.data.accessToken) {
          setAccessToken(res.data.accessToken);
        }
      } catch (err) {
        // Jika gagal (cookie mati/expired), biarkan, nanti loadMe akan return null
      }
      
      await loadMe();
      setAuthLoading(false);
    };

    initSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, authLoading, refreshProfile, logout }}>
      {!authLoading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
