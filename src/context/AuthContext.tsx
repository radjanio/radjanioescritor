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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    const supabase = getSupabase();
    const live = isSupabaseConfigured();
    setIsSupabaseLive(live);

    if (supabase && live) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setIsAuthenticated(true);
          setUserEmail(data.session.user.email || 'autor@radjanio.com');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão Supabase:', err);
      }
    }

    // Check local session
    const localSess = localStorage.getItem(LOCAL_AUTH_KEY);
    if (localSess) {
      try {
        const parsed = JSON.parse(localSess);
        if (parsed.authenticated) {
          setIsAuthenticated(true);
          setUserEmail(parsed.email || 'radjaniokk@gmail.com');
        }
      } catch {
        localStorage.removeItem(LOCAL_AUTH_KEY);
      }
    }
    setIsLoading(false);
  };

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

    // Direct admin login fallback (when author is setting up the site or testing)
    // Default admin password for initial author access or custom password
    if (pass === 'admin123' || pass === 'radjanio2026' || pass.length >= 6) {
      const sess = { authenticated: true, email: email || 'radjaniokk@gmail.com', time: Date.now() };
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(sess));
      setIsAuthenticated(true);
      setUserEmail(sess.email);
      return { success: true };
    }

    return {
      success: false,
      error: 'Senha incorreta. (Para acesso inicial, use a senha padrão: admin123 ou conecte seu Supabase Auth)'
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
