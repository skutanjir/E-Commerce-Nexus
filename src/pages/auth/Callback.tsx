import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAccessToken } from '../../lib/api';
import { useUser } from '../../contexts/UserContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useUser();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      setAccessToken(token);
      refreshProfile().then(() => {
        if (role === 'seller') {
          navigate('/admin-dashboard-overview', { replace: true });
        } else {
          navigate('/user-dashboard', { replace: true });
        }
      });
    } else {
      navigate('/login-page', { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant text-sm font-medium">Memproses login...</p>
      </div>
    </div>
  );
}
