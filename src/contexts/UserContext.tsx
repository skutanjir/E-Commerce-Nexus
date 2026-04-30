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
    // Rely on the axios interceptor to handle the /auth/refresh process deduplication automatically.
    // If we don't have a valid token, interceptor will catch the 401 and refresh it exactly once.
    loadMe().finally(() => setAuthLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, authLoading, refreshProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
