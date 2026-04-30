import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import type { Profile } from '../types';

interface AdminContextValue {
  adminProfile: Profile | null;
  adminLoading: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  adminProfile: null,
  adminLoading: true,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { profile, authLoading } = useUser();
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!profile) {
      navigate('/login-page');
      setAdminLoading(false);
      return;
    }

    if (profile.role !== 'seller') {
      navigate('/user-dashboard');
      setAdminLoading(false);
      return;
    }

    setAdminProfile(profile);
    setAdminLoading(false);
  }, [authLoading, profile, navigate]);

  return (
    <AdminContext.Provider value={{ adminProfile, adminLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
