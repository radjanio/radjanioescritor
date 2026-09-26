import React, { useState } from 'react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
  getSupabase
} from '../../lib/supabase';
import { Database, CheckCircle, AlertCircle, Copy, Check, RefreshCw, Key, Globe, Shield } from 'lucide-react';

export const SupabaseSetupTab: React.FC = () => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isConnected = isSupabaseConfigured();

  const handleSave = () => {
    if (!url.startsWith('https://') || !anonKey.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'Por favor, insira uma URL válida do Supabase (ex: https://xyz.supabase.co) e a chave pública Anon.'
      });
      return;
    }

    saveSupabaseCredentials(url, anonKey);
    setStatusMsg({
      type: 'success',
      text: 'Credenciais salvas com sucesso no navegador! Testando conexão...'
    });
    testConnection();
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setStatusMsg({
      type: 'info',
      text: 'Credenciais do Supabase removidas. O sistema continuará operando com armazenamento persistente local.'
    });
  };

  const testConnection = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setStatusMsg({ type: 'error', text: 'Não foi possível inicializar o cliente Supabase.' });
        setTesting(false);
        return;
      }

      // Ping books table or site_settings
      const { data, error } = await supabase.from('site_settings').select('author_name').limit(1);
      if (error) {
        if (error.code === '42P01') {
          setStatusMsg({
            type: 'error',
            text: 'Conexão com o Supabase estabelecida, mas as tabelas ainda não foram criadas! Execute o script SQL abaixo no Supabase SQL Editor.'
          });
        } else {
          setStatusMsg({
            type: 'error',
            text: `Erro retornado pelo Supabase: ${error.message}`
          });
        }
      } else {
        setStatusMsg({
          type: 'success',
          text: 'Conexão com o banco de dados Supabase validada e operando com sucesso!'
        });
      }
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: `Falha ao testar conexão: ${e?.message || e}`
      });
    } finally {
      setTesting(false);
    }
  };

  const sqlSchemaScript = `-- =========================================================================
-- ESQUEMA COMPLETO DO SUPABASE — RADJANIO SILVA SOUZA (SITE OFICIAL)
-- Copie e cole este script no Supabase SQL Editor (SQL Editor -> New Query)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE LIVROS
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  edition TEXT,
  description TEXT NOT NULL,
  short_description TEXT,
  genre TEXT NOT NULL,
  price NUMERIC(10, 2),
  page_count INTEGER,
  cover_url TEXT,
  store_url TEXT,
  status TEXT NOT NULL DEFAULT 'Em desenvolvimento' CHECK (status IN ('Publicado', 'Em desenvolvimento', 'Em breve', 'Finalizado')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  publication_date DATE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DE ETAPAS DO LIVRO
CREATE TABLE IF NOT EXISTS public.book_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em andamento', 'Concluído')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE PROJETOS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em andamento',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  image_url TEXT,
  start_date DATE,
  expected_release_date DATE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE ATUALIZAÇÕES / DIÁRIO
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('Escrita', 'Capítulos', 'Ideias', 'Revisão', 'Capa', 'Publicação', 'Desenvolvimento', 'Reflexões')),
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE TEXTOS AUTORAIS
CREATE TABLE IF NOT EXISTS public.texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Poemas', 'Contos', 'Crônicas', 'Reflexões', 'Fragmentos')),
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA DE LINHA DO TEMPO
CREATE TABLE IF NOT EXISTS public.timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABELA DE GALERIA
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Capas', 'Conceitos', 'Ilustrações', 'Fotografias', 'Outros')),
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABELA DE CONFIGURAÇÕES DO SITE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL DEFAULT 'Radjanio Silva Souza',
  biography TEXT NOT NULL DEFAULT '',
  author_photo_url TEXT,
  author_quote TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT 'radjaniokk@gmail.com',
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir dados base de configurações se vazio
INSERT INTO public.site_settings (id, author_name, biography, author_quote, email)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  'Radjanio Silva Souza',
  'Radjanio Silva Souza é autor e escritor contemporâneo, dedicado à ficção, narrativas imersivas e à investigação das complexidades humanas através da palavra escrita.',
  'A escrita é a ponte silenciosa entre o abismo interior e a luz compartilhada.',
  'radjaniokk@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Compatibilidade e migração suave para bases já existentes
ALTER TABLE IF EXISTS public.books ADD COLUMN IF NOT EXISTS page_count INTEGER;

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de livros" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admin gerencia livros" ON public.books FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de etapas" ON public.book_stages FOR SELECT USING (true);
CREATE POLICY "Admin gerencia etapas" ON public.book_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de projetos" ON public.projects FOR SELECT USING (is_public = true);
CREATE POLICY "Admin gerencia projetos" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de atualizações" ON public.updates FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia atualizações" ON public.updates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de textos" ON public.texts FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia textos" ON public.texts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de timeline" ON public.timeline FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia timeline" ON public.timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de galeria" ON public.gallery FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia galeria" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de configurações" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin gerencia configurações" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('author-assets', 'author-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Leitura pública de assets" ON storage.objects FOR SELECT USING (bucket_id = 'author-assets');
CREATE POLICY "Upload permitido apenas para autenticados" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'author-assets');
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Conexão Supabase &amp; Banco de Dados
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Configure a conexão direta com o Supabase PostgreSQL, Authentication e Supabase Storage.
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
              Status da Conexão: {isConnected ? 'Configurada' : 'Armazenamento Local Ativo (Standby)'}
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isConnected
                ? 'As requisições públicas e administrativas estão sincronizadas com seu projeto Supabase.'
                : 'Você pode utilizar o painel normalmente; as alterações persistem no navegador até que você conecte o Supabase.'}
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
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzabcdefg.supabase.co"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
            />
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            Encontrado no painel do Supabase em Project Settings &gt; API &gt; Project URL
          </span>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Anon Public Key (VITE_SUPABASE_ANON_KEY)
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-700"
            />
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            Chave pública (anon/public). <strong>Nunca utilize a Service Role Key no navegador.</strong>
          </span>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-sm bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Salvar e Conectar
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

      {/* SQL Script Viewer */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
              Script SQL de Criação (Tabelas, RLS e Storage)
            </h3>
            <p className="text-xs text-stone-500">
              Copie e cole este script no editor SQL do seu projeto Supabase para gerar todas as tabelas em 1 clique.
            </p>
          </div>
          <button
            onClick={copySql}
            className="px-4 py-2 rounded-sm bg-amber-800 text-stone-50 dark:bg-amber-600 hover:bg-amber-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>

        <div className="bg-stone-950 text-stone-300 p-4 rounded-sm font-mono text-[11px] max-h-64 overflow-y-auto border border-stone-800">
          <pre>{sqlSchemaScript}</pre>
        </div>
      </div>
    </div>
  );
};
