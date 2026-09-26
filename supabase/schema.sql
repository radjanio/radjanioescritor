-- =========================================================================
-- ESQUEMA COMPLETO E IDEMPOTENTE DO SUPABASE — RADJANIO SILVA SOUZA
-- Copie e cole este script no Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- Pode ser executado múltiplas vezes com total segurança (DROP POLICY IF EXISTS)
-- =========================================================================

-- 1. Extensões essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabela de Livros (books)
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

-- Coluna retrocompatível para bancos existentes
ALTER TABLE IF EXISTS public.books ADD COLUMN IF NOT EXISTS page_count INTEGER;

-- 3. Tabela de Etapas do Livro (book_stages)
CREATE TABLE IF NOT EXISTS public.book_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em andamento', 'Concluído')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Projetos Literários (projects)
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

-- 5. Tabela do Diário de Escrita / Atualizações (updates)
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

-- 6. Tabela de Textos & Ensaios (texts)
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

-- 7. Tabela da Linha do Tempo (timeline)
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

-- 8. Tabela de Galeria Visual (gallery)
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

-- 9. Tabela de Configurações do Site (site_settings)
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

-- Inserir dados padrão do autor se a tabela estiver vazia
INSERT INTO public.site_settings (id, author_name, biography, author_quote, email)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Radjanio Silva Souza',
  'Radjanio Silva Souza é autor e escritor contemporâneo, dedicado à ficção, narrativas imersivas e à investigação das complexidades humanas através da palavra escrita.',
  'A escrita é a ponte silenciosa entre o abismo interior e a luz compartilhada.',
  'radjaniokk@gmail.com'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- SEGURANÇA: HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Books
DROP POLICY IF EXISTS "Leitura pública de livros" ON public.books;
CREATE POLICY "Leitura pública de livros" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gerencia livros" ON public.books;
CREATE POLICY "Admin gerencia livros" ON public.books FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Book Stages
DROP POLICY IF EXISTS "Leitura pública de etapas" ON public.book_stages;
CREATE POLICY "Leitura pública de etapas" ON public.book_stages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gerencia etapas" ON public.book_stages;
CREATE POLICY "Admin gerencia etapas" ON public.book_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Projects
DROP POLICY IF EXISTS "Leitura pública de projetos públicos" ON public.projects;
CREATE POLICY "Leitura pública de projetos públicos" ON public.projects FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Admin gerencia todos os projetos" ON public.projects;
CREATE POLICY "Admin gerencia todos os projetos" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Updates
DROP POLICY IF EXISTS "Leitura pública de atualizações publicadas" ON public.updates;
CREATE POLICY "Leitura pública de atualizações publicadas" ON public.updates FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin gerencia atualizações" ON public.updates;
CREATE POLICY "Admin gerencia atualizações" ON public.updates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Texts
DROP POLICY IF EXISTS "Leitura pública de textos publicados" ON public.texts;
CREATE POLICY "Leitura pública de textos publicados" ON public.texts FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin gerencia textos" ON public.texts;
CREATE POLICY "Admin gerencia textos" ON public.texts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Timeline
DROP POLICY IF EXISTS "Leitura pública de timeline publicada" ON public.timeline;
CREATE POLICY "Leitura pública de timeline publicada" ON public.timeline FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin gerencia timeline" ON public.timeline;
CREATE POLICY "Admin gerencia timeline" ON public.timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Gallery
DROP POLICY IF EXISTS "Leitura pública de galeria publicada" ON public.gallery;
CREATE POLICY "Leitura pública de galeria publicada" ON public.gallery FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin gerencia galeria" ON public.gallery;
CREATE POLICY "Admin gerencia galeria" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Site Settings
DROP POLICY IF EXISTS "Leitura pública de configurações" ON public.site_settings;
CREATE POLICY "Leitura pública de configurações" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gerencia configurações" ON public.site_settings;
CREATE POLICY "Admin gerencia configurações" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- CONFIGURAÇÃO DO BUCKET DE ARMAZENAMENTO DE IMAGENS (author-assets)
-- =========================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('author-assets', 'author-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Leitura pública de assets" ON storage.objects;
CREATE POLICY "Leitura pública de assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'author-assets');

DROP POLICY IF EXISTS "Upload permitido apenas para autenticados" ON storage.objects;
CREATE POLICY "Upload permitido apenas para autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'author-assets');

DROP POLICY IF EXISTS "Atualização permitida apenas para autenticados" ON storage.objects;
CREATE POLICY "Atualização permitida apenas para autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'author-assets');

DROP POLICY IF EXISTS "Remoção permitida apenas para autenticados" ON storage.objects;
CREATE POLICY "Remoção permitida apenas para autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'author-assets');
