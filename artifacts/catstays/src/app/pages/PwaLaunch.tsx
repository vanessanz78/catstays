import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

export function PwaLaunch() {
  const navigate = useNavigate();
  const { accountRole, loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (accountRole === 'owner' || accountRole === 'staff') {
      navigate('/staff-dashboard', { replace: true });
      return;
    }
    navigate('/client-portal', { replace: true });
  }, [accountRole, loading, navigate, user]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#F8F7F5] text-[#0A1128]">
      <div className="text-center">
        <img src="/icons/icon-192.png" alt="" className="mx-auto h-20 w-20" />
        <p className="mt-4 text-sm text-[#4E5871]">Opening CatStays…</p>
      </div>
    </div>
  );
}
