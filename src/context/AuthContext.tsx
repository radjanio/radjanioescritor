import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  loginWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  isLoading: true,
  loginWithPassword: async () => ({ success: false }),
  logout: async () => {},
  isSupabaseLive: false,
});

const LOCAL_AUTH_KEY = 'radjanio_admin_session';

function getInitialLocalAuth(): { authenticated: boolean; email: string | null } {
  if (typeof window === 'undefined') {
    return { authenticated: false, email: null };
  }
  try {
    const localSess = localStorage.getItem(LOCAL_AUTH_KEY);
    if (localSess) {
      const parsed = JSON.parse(localSess);
      if (parsed.authenticated) {
        return { authenticated: true, email: parsed.email || 'radjaniokk@gmail.com' };
      }
    }
    // Check for Supabase session stored by @supabase/supabase-js
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
        const val = localStorage.getItem(key);
        if (val && val.includes('access_token')) {
          const parsed = JSON.parse(val);
          const email = parsed?.user?.email || 'autor@radjanio.com';
          return { authenticated: true, email };
        }
      }
    }
  } catch {
    // fallback
  }
  return { authenticated: false, email: null };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialAuth = getInitialLocalAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth.authenticated);
  const [userEmail, setUserEmail] = useState<string | null>(initialAuth.email);
  const [isLoading, setIsLoading] = useState<boolean>(!initialAuth.authenticated);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabase();
    const live = isSupabaseConfigured();
    setIsSupabaseLive(live);

    let authSubscription: { unsubscribe: () => void } | null = null;

    if (supabase && live) {
      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        if (data.session?.user) {
          setIsAuthenticated(true);
          setUserEmail(data.session.user.email || 'autor@radjanio.com');
        }
        setIsLoading(false);
      }).catch((err) => {
        console.warn('Erro ao verificar sessão Supabase:', err);
        if (isMounted) setIsLoading(false);
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || 'autor@radjanio.com');
        } else if (!localStorage.getItem(LOCAL_AUTH_KEY)) {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      });
      authSubscription = data.subscription;
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  const loginWithPassword = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    const live = isSupabaseConfigured();

    if (supabase && live) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          setIsAuthenticated(true);
          setUserEmail(data.user.email || email);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Falha ao conectar com o serviço de autenticação.' };
      }
    }

    if (!live || !supabase) {
      return {
        success: false,
        error: 'O Supabase não está configurado. Conecte sua URL e chave Anon nas variáveis de ambiente (.env) para habilitar o login seguro do autor.'
      };
    }

    return {
      success: false,
      error: 'E-mail ou senha incorretos.'
    };
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        isLoading,
        loginWithPassword,
        logout,
        isSupabaseLive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
