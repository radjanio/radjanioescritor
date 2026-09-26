-- =========================================================================
-- ESQUEMA COMPLETO DO SUPABASE — RADJANIO SILVA SOUZA (SITE OFICIAL)
-- Copie TODO este código e execute no SQL Editor do Supabase
-- =========================================================================

-- 1. Habilitar extensões
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

-- 4. Tabela de Projetos (projects)
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

-- 5. Tabela de Atualizações / Diário (updates)
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

-- Inserir configuração inicial se não existir
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
-- HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- =========================================================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- POLÍTICAS DE ACESSO (RLS POLICIES)
-- =========================================================================

-- Books
DROP POLICY IF EXISTS "books_select_policy" ON public.books;
CREATE POLICY "books_select_policy" ON public.books
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "books_admin_policy" ON public.books;
CREATE POLICY "books_admin_policy" ON public.books
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Book Stages
DROP POLICY IF EXISTS "stages_select_policy" ON public.book_stages;
CREATE POLICY "stages_select_policy" ON public.book_stages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "stages_admin_policy" ON public.book_stages;
CREATE POLICY "stages_admin_policy" ON public.book_stages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
CREATE POLICY "projects_select_policy" ON public.projects
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "projects_admin_policy" ON public.projects;
CREATE POLICY "projects_admin_policy" ON public.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Updates
DROP POLICY IF EXISTS "updates_select_policy" ON public.updates;
CREATE POLICY "updates_select_policy" ON public.updates
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "updates_admin_policy" ON public.updates;
CREATE POLICY "updates_admin_policy" ON public.updates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Texts
DROP POLICY IF EXISTS "texts_select_policy" ON public.texts;
CREATE POLICY "texts_select_policy" ON public.texts
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "texts_admin_policy" ON public.texts;
CREATE POLICY "texts_admin_policy" ON public.texts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Timeline
DROP POLICY IF EXISTS "timeline_select_policy" ON public.timeline;
CREATE POLICY "timeline_select_policy" ON public.timeline
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "timeline_admin_policy" ON public.timeline;
CREATE POLICY "timeline_admin_policy" ON public.timeline
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gallery
DROP POLICY IF EXISTS "gallery_select_policy" ON public.gallery;
CREATE POLICY "gallery_select_policy" ON public.gallery
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "gallery_admin_policy" ON public.gallery;
CREATE POLICY "gallery_admin_policy" ON public.gallery
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site Settings
DROP POLICY IF EXISTS "settings_select_policy" ON public.site_settings;
CREATE POLICY "settings_select_policy" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_admin_policy" ON public.site_settings;
CREATE POLICY "settings_admin_policy" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- BUCKET DE ARMAZENAMENTO DE IMAGENS & ARQUIVOS (author-assets)
-- =========================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('author-assets', 'author-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "assets_select_policy" ON storage.objects;
CREATE POLICY "assets_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'author-assets');

DROP POLICY IF EXISTS "assets_insert_policy" ON storage.objects;
CREATE POLICY "assets_insert_policy" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'author-assets');

DROP POLICY IF EXISTS "assets_update_policy" ON storage.objects;
CREATE POLICY "assets_update_policy" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'author-assets');

DROP POLICY IF EXISTS "assets_delete_policy" ON storage.objects;
CREATE POLICY "assets_delete_policy" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'author-assets');
