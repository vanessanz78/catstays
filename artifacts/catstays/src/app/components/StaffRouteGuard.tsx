import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

export function StaffRouteGuard({ children }: { children: ReactNode }) {
  const { accountRole, cattery, loading, user } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8F7F5] text-[#4E5871]">
        <div className="flex items-center gap-2" role="status">
          <Loader2 className="h-5 w-5 animate-spin text-[#C46A3A]" />
          Checking staff access…
        </div>
      </main>
    );
  }

  const hasStaffAccess = Boolean(user && cattery && (accountRole === 'owner' || accountRole === 'staff'));
  if (!hasStaffAccess) {
    const customerSession = accountRole === 'customer';
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8F7F5] px-4 py-10 text-[#0A1128]">
        <section className="w-full max-w-xl rounded-2xl border border-[#E8DED4] bg-white p-8 text-center shadow-sm">
          <Lock className="mx-auto h-9 w-9 text-[#C46A3A]" />
          <h1 className="mt-4 text-2xl font-semibold">Staff access required</h1>
          <p className="mt-2 text-sm leading-6 text-[#4E5871]">
            {customerSession
              ? 'This account is linked to the client portal, not the cattery staff workspace.'
              : 'Sign in with the exact email saved and enabled by your cattery owner in Staff profiles.'}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/staff-login">
              <Button className="w-full rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30] sm:w-auto">
                Staff sign-in
              </Button>
            </Link>
            <Link to="/client-portal">
              <Button variant="outline" className="w-full rounded-xl border-[#0A1128]/15 sm:w-auto">
                Client portal
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

export function withStaffGuard(Component: ComponentType) {
  return function GuardedStaffRoute() {
    return (
      <StaffRouteGuard>
        <Component />
      </StaffRouteGuard>
    );
  };
}