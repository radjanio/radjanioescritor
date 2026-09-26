-- =========================================================================
-- ESQUEMA COMPLETO DO SUPABASE — RADJANIO SILVA SOUZA (SITE OFICIAL)
-- Copie e cole este script no Supabase SQL Editor (SQL Editor -> New Query)
-- =========================================================================

-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE LIVROS (books)
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

-- 2. TABELA DE ETAPAS DO LIVRO (book_stages)
CREATE TABLE IF NOT EXISTS public.book_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em andamento', 'Concluído')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE PROJETOS (projects)
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

-- 4. TABELA DE ATUALIZAÇÕES / DIÁRIO (updates)
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

-- 5. TABELA DE TEXTOS (texts)
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

-- 6. TABELA DE LINHA DO TEMPO (timeline)
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

-- 7. TABELA DE GALERIA (gallery)
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

-- 8. TABELA DE CONFIGURAÇÕES DO SITE (site_settings)
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

-- Inserir configuração inicial se não existir
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

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Books: Leitura pública para todos; modificações apenas autenticados
CREATE POLICY "Leitura pública de livros" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admin gerencia livros" ON public.books FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Book Stages: Leitura pública; modificação admin
CREATE POLICY "Leitura pública de etapas" ON public.book_stages FOR SELECT USING (true);
CREATE POLICY "Admin gerencia etapas" ON public.book_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Projects: Visitantes só leem projetos públicos (is_public = true); admin lê e altera tudo
CREATE POLICY "Leitura pública de projetos públicos" ON public.projects FOR SELECT USING (is_public = true);
CREATE POLICY "Admin gerencia todos os projetos" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Updates: Visitantes leem apenas publicados (published = true); admin tudo
CREATE POLICY "Leitura pública de atualizações publicadas" ON public.updates FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia atualizações" ON public.updates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Texts: Visitantes leem apenas publicados (published = true); admin tudo
CREATE POLICY "Leitura pública de textos publicados" ON public.texts FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia textos" ON public.texts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Timeline: Visitantes leem publicados (published = true); admin tudo
CREATE POLICY "Leitura pública de timeline publicada" ON public.timeline FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia timeline" ON public.timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Gallery: Visitantes leem publicados (published = true); admin tudo
CREATE POLICY "Leitura pública de galeria publicada" ON public.gallery FOR SELECT USING (published = true);
CREATE POLICY "Admin gerencia galeria" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Site Settings: Leitura pública; admin altera
CREATE POLICY "Leitura pública de configurações" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin gerencia configurações" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- =========================================================================

-- Criar bucket público 'author-assets' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('author-assets', 'author-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para author-assets
CREATE POLICY "Leitura pública de assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'author-assets');

CREATE POLICY "Upload permitido apenas para autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'author-assets');

CREATE POLICY "Atualização permitida apenas para autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'author-assets');

CREATE POLICY "Remoção permitida apenas para autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'author-assets');
