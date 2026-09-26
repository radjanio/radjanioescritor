import React, { useState } from 'react';
import { getSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials, isSupabaseConfigured, getSupabase } from '../../lib/supabase';
import { Database, Key, Globe, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SupabaseSetupTabProps {
  onConnectionChange?: () => void;
}

export const SupabaseSetupTab: React.FC<SupabaseSetupTabProps> = ({ onConnectionChange }) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const isConnected = isSupabaseConfigured();

  const handleSave = async () => {
    setStatusMsg(null);
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'Por favor, preencha a URL do projeto e a chave anônima (anon key).'
      });
      return;
    }

    setTesting(true);
    saveSupabaseCredentials(url.trim(), anonKey.trim());
    try {
      const client = getSupabase();
      if (!client) throw new Error('Cliente inválido');
      const { error } = await client.from('site_settings').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setStatusMsg({
        type: 'success',
        text: 'Conexão com o Supabase estabelecida com sucesso! Todos os dados agora são carregados e salvos diretamente no seu banco de dados.'
      });
      onConnectionChange?.();
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: `Erro ao conectar com o Supabase: ${e?.message || 'Verifique as credenciais.'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setStatusMsg({
      type: 'info',
      text: 'Conexão Supabase desconectada.'
    });
    onConnectionChange?.();
  };

  const testConnection = async () => {
    setStatusMsg(null);
    setTesting(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase não inicializado.');
      const { error } = await client.from('site_settings').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setStatusMsg({
        type: 'success',
        text: 'Conexão com o banco de dados Supabase validada e operando com sucesso!'
      });
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: `Falha ao testar conexão: ${e?.message || e}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Conexão com o Banco de Dados (Supabase)
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Gerencie a integração direta com o Supabase. Nenhuma informação pessoal ou instrução SQL fica armazenada no código do site.
        </p>
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-sm border flex items-center justify-between ${
        isConnected
          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
          : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500/40 text-amber-900 dark:text-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold">
              Status da Conexão: {isConnected ? 'Sincronizado com Supabase' : 'Aguardando Credenciais'}
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isConnected
                ? 'Suas informações e conteúdos são carregados e gerenciados exclusivamente a partir do seu banco de dados.'
                : 'Insira a URL e a chave pública (anon key) do seu projeto Supabase para ativar a sincronização em tempo real.'}
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            onClick={testConnection}
            disabled={testing}
            className="px-3 py-1.5 rounded-sm bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs font-medium border border-stone-300 dark:border-stone-700 hover:bg-stone-50 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div className={`p-3.5 rounded-sm text-xs border flex items-start gap-2 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : statusMsg.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-6 space-y-4">
        <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-800 dark:text-amber-400" />
          <span>Credenciais do Projeto Supabase</span>
        </h3>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Project URL (VITE_SUPABASE_URL)
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://seu-projeto.supabase.co"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
            />
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">
            Disponível no painel do Supabase em Project Settings &gt; API &gt; Project URL
          </span>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Anon Public Key (VITE_SUPABASE_ANON_KEY)
          </label>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
            />
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">
            Chave pública segura para cliente (Project Settings &gt; API &gt; Project API keys &gt; anon public)
          </span>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={testing}
            className="px-5 py-2.5 rounded-sm bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {testing ? 'Conectando...' : 'Salvar e Conectar'}
          </button>
          {isConnected && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-sm border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs uppercase tracking-wider font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
