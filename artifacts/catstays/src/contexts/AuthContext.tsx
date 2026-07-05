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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  cattery: Cattery | null;
  loading: boolean;
  signUp: (email: string, password: string, businessName: string, ownerName: string) => Promise<{ error: Error | null; userId: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshCattery: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cattery, setCattery] = useState<Cattery | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCattery = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('catteries')
        .select('*')
        .eq('owner_id', userId)
        .single();
      if (!error && data) {
        setCattery(data as Cattery);
      } else {
        setCattery(null);
      }
    } catch {
      setCattery(null);
    }
  };

  const refreshCattery = async () => {
    if (user) await loadCattery(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCattery(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCattery(session.user.id);
      } else {
        setCattery(null);
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
        await loadCattery(data.user!.id);
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setCattery(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, cattery, loading, signUp, signIn, signOut, refreshCattery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
