import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { Feather, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { isAuthenticated, loginWithPassword, isSupabaseLive } = useAuth();
  const [email, setEmail] = useState('radjaniosilvasouza7@gmail.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await loginWithPassword(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <SEOHead
        title="Acesso Administrativo"
        description="Painel de controle editorial exclusivo para o autor Radjanio Silva Souza."
      />

      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-8 sm:p-10 shadow-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center mx-auto text-amber-800 dark:text-amber-400">
            <Feather className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Acesso do Autor
          </h1>
          <p className="text-xs text-stone-500">
            {isSupabaseLive
              ? 'Conexão Supabase Auth ativa'
              : 'Painel Editorial — Radjanio Silva Souza'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-sm bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Acessar Painel'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Acesso do autor com e-mail cadastrado ou senha inicial <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-amber-800 dark:text-amber-400">123admin</code>. Você pode trocar a senha a qualquer momento nas configurações do painel.
          </p>
        </div>
      </div>
    </div>
  );
};
