import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';
import { getConfirmEmailUrl } from '@/utils/appUrl';

interface Cattery {
  id: string;
  name: string;
  slug: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  logo_url: string | null;
  website_settings: Record<string, unknown>;
  subscription_status: string;
}

export type AccountRole = 'owner' | 'staff' | 'customer' | null;

export interface CustomerProfile {
  id: string;
  cattery_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  cattery: Cattery | null;
  accountRole: AccountRole;
  customer: CustomerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, businessName: string, ownerName: string) => Promise<{ error: Error | null; userId: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpCustomer: (email: string, password: string, fullName: string, catteryId: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshCattery: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cattery, setCattery] = useState<Cattery | null>(null);
  const [accountRole, setAccountRole] = useState<AccountRole>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccount = async (userId: string) => {
    try {
      const { data: ownedCattery, error: ownerError } = await supabase
        .from('catteries')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();
      if (!ownerError && ownedCattery) {
        setCattery(ownedCattery as Cattery);
        setAccountRole('owner');
        setCustomer(null);
        void import('@/lib/pwa').then(({ recoverCatStaysPhoneNotifications }) => {
          recoverCatStaysPhoneNotifications(String(ownedCattery.id));
        });
        return;
      }

      const { data: membership } = await supabase
        .from('staff_memberships')
        .select('cattery_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      if (membership?.cattery_id) {
        const { data: staffCattery } = await supabase
          .from('catteries')
          .select('*')
          .eq('id', membership.cattery_id)
          .maybeSingle();
        if (staffCattery) {
          setCattery(staffCattery as Cattery);
          setAccountRole('staff');
          setCustomer(null);
          void import('@/lib/pwa').then(({ recoverCatStaysPhoneNotifications }) => {
            recoverCatStaysPhoneNotifications(String(staffCattery.id));
          });
          return;
        }
      }

      const { data: customerProfile } = await supabase
        .from('customers')
        .select('id,cattery_id,user_id,name,email,phone')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (customerProfile?.cattery_id) {
        const { data: customerCattery } = await supabase
          .from('catteries')
          .select('*')
          .eq('id', customerProfile.cattery_id)
          .maybeSingle();
        setCattery((customerCattery || null) as Cattery | null);
        setAccountRole('customer');
        setCustomer(customerProfile as CustomerProfile);
        void import('@/lib/pwa').then(({ recoverCatStaysPhoneNotifications }) => {
          recoverCatStaysPhoneNotifications(String(customerProfile.cattery_id));
        });
        return;
      }

      setCattery(null);
      setAccountRole(null);
      setCustomer(null);
    } catch {
      setCattery(null);
      setAccountRole(null);
      setCustomer(null);
    }
  };

  const refreshCattery = async () => {
    if (user) await loadAccount(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAccount(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        loadAccount(session.user.id).finally(() => setLoading(false));
      } else {
        setCattery(null);
        setAccountRole(null);
        setCustomer(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, businessName: string, ownerName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: ownerName, business_name: businessName },
        emailRedirectTo: getConfirmEmailUrl(),
      }
    });

    if (error) return { error, userId: null };

    if (data.user) {
      // The database trigger auto-creates the cattery on signup.
      // Retry loading it a few times to handle the async delay.
      let attempts = 0;
      const tryLoad = async () => {
        attempts++;
        await loadAccount(data.user!.id);
        if (!cattery && attempts < 5) {
          await new Promise(r => setTimeout(r, 600));
          await tryLoad();
        }
      };
      await tryLoad();
    }

    return { error: null, userId: data.user?.id ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  };

  const signUpCustomer = async (email: string, password: string, fullName: string, catteryId: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: 'customer',
          full_name: fullName,
          cattery_id: catteryId,
        },
        emailRedirectTo: `${window.location.origin}/client-portal`,
      },
    });
    return { error: error ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCattery(null);
    setAccountRole(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, cattery, accountRole, customer, loading, signUp, signIn, signUpCustomer, signOut, refreshCattery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
