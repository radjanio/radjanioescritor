import {
  Book,
  BookStage,
  BookStageStatus,
  Project,
  Update,
  TextItem,
  TimelineEvent,
  GalleryItem,
  SiteSettings,
  AcademicItem,
  AcademicType,
  AcademicStatus
} from '../types';
import { getSupabase, isSupabaseConfigured } from './supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(val: any): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

export function sanitizeUuid(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

export function sanitizeDate(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed === '') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return null;
}

export function sanitizeNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'a0000000-0000-0000-0000-000000000001',
  author_name: 'Radjanio Silva Souza',
  biography: 'Radjanio Silva Souza é autor e escritor contemporâneo, dedicado à ficção, narrativas imersivas e à investigação das complexidades humanas através da palavra escrita.',
  author_photo_url: '',
  author_quote: 'A escrita é a ponte silenciosa entre o abismo interior e a luz compartilhada.',
  email: 'radjaniokk@gmail.com',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  lattes_url: '',
  orcid_url: '',
  updated_at: new Date().toISOString()
};

const DEFAULT_ACADEMIC_ITEMS: AcademicItem[] = [
  {
    id: 'acad-11111111-0001-4000-8000-000000000001',
    title: 'Graduação em Letras (Língua Portuguesa & Literaturas)',
    type: 'Formação',
    institution: 'Universidade Federal / Estadual',
    degree_level: 'Bacharelado & Licenciatura',
    field_of_study: 'Estudos Literários e Teoria da Ficção',
    start_year: '2019',
    end_year: '2023',
    status: 'Concluído',
    workload_hours: 3200,
    description: 'Estudo aprofundado de literatura brasileira e portuguesa, filologia, poética clássica, crítica textual e análise estilística do romance contemporâneo.',
    thesis_title: 'O Ritmo da Ausência: Silêncio e Construção Cênica na Prosa Moderna',
    advisor: 'Prof. Dr. em Teoria Literária',
    certificate_url: '',
    external_link: '',
    order_index: 0,
    featured: true,
    published: true,
    created_at: '2023-12-15T12:00:00.000Z'
  },
  {
    id: 'acad-22222222-0002-4000-8000-000000000002',
    title: 'Especialização em Escrita Criativa & Narratologia Avançada',
    type: 'Formação',
    institution: 'Instituto de Pós-Graduação & Artes da Palavra',
    degree_level: 'Pós-Graduação Lato Sensu',
    field_of_study: 'Criação Literária e Roteiro de Ficção',
    start_year: '2024',
    end_year: '2025',
    status: 'Em andamento',
    workload_hours: 420,
    description: 'Investigação das técnicas de construção de romances de fôlego, arco dramático, polifonia e consistência de vozes narrativas.',
    thesis_title: 'Mapeamento Arquitetônico de Ficção de Longa Duração',
    advisor: '',
    certificate_url: '',
    external_link: '',
    order_index: 1,
    featured: true,
    published: true,
    created_at: '2024-03-10T12:00:00.000Z'
  },
  {
    id: 'acad-33333333-0003-4000-8000-000000000003',
    title: 'Oficina de Laboratório de Criação e Worldbuilding Literário',
    type: 'Curso & Oficina',
    institution: 'Laboratório de Práticas Narrativas',
    degree_level: 'Extensão Universitária',
    field_of_study: 'Ficção Especulativa e Narrativa Imersiva',
    start_year: '2024',
    end_year: '2024',
    status: 'Concluído',
    workload_hours: 60,
    description: 'Módulo imersivo dedicado à consistência lógica e sensorial de cenários ficcionais, ressonância temática e verossimilhança interna.',
    order_index: 2,
    featured: false,
    published: true,
    created_at: '2024-07-20T12:00:00.000Z'
  },
  {
    id: 'acad-44444444-0004-4000-8000-000000000004',
    title: 'A Poética do Não-Dito: O Subtexto na Literatura Contemporânea',
    type: 'Artigo & Pesquisa',
    institution: 'Revista de Estudos Literários & Cadernos Críticos',
    degree_level: 'Artigo Científico / Ensaio',
    field_of_study: 'Crítica Literária',
    start_year: '2024',
    end_year: '2024',
    status: 'Concluído',
    description: 'Artigo analítico sobre a gestão da informação, a economia das palavras e o impacto do silêncio sobre a imaginação e a experiência do leitor.',
    order_index: 3,
    featured: true,
    published: true,
    created_at: '2024-09-05T12:00:00.000Z'
  },
  {
    id: 'acad-55555555-0005-4000-8000-000000000005',
    title: 'Palestra: Da Ideia ao Livro Impresso — Rigor e Disciplina Autoral',
    type: 'Palestra & Docência',
    institution: 'Semana Literária & Jornada Acadêmica de Letras',
    degree_level: 'Conferência Convidada',
    field_of_study: 'Produção Editorial e Criação Autoral',
    start_year: '2024',
    end_year: '2024',
    status: 'Concluído',
    workload_hours: 4,
    description: 'Conferência ministrada sobre a superação dos bloqueios criativos, estruturação de rascunhos, publicação independente e a rotina da escrita.',
    order_index: 4,
    featured: false,
    published: true,
    created_at: '2024-11-12T12:00:00.000Z'
  }
];

// Local storage buffer for offline fallback
const STORAGE_PREFIX = 'radjanio_app_';
function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('Falha ao salvar no armazenamento local:', e);
  }
}

export const repository = {
  // ===================== SITE SETTINGS =====================
  async getSettings(): Promise<SiteSettings> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        if (!error && data) {
          return data as SiteSettings;
        }
      } catch (err) {
        console.warn('Erro ao carregar configurações do Supabase:', err);
      }
    }
    return getLocal<SiteSettings>('settings', DEFAULT_SETTINGS);
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...settings,
      id: current.id || 'a0000000-0000-0000-0000-000000000001',
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(updated, { onConflict: 'id' });
      if (error) {
        console.error('Erro ao atualizar configurações no Supabase:', error.message);
        throw new Error(`Falha ao salvar configurações no Supabase: ${error.message}`);
      }
    }

    setLocal('settings', updated);
    return updated;
  },

  // ===================== BOOKS =====================
  async getBooks(): Promise<Book[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*, stages:book_stages(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((b: any) => ({
            ...b,
            stages: (b.stages || []).sort((x: BookStage, y: BookStage) => (x.order_index ?? 0) - (y.order_index ?? 0))
          }));
        }
      } catch (err) {
        console.warn('Erro ao buscar livros do Supabase:', err);
      }
    }
    return getLocal<Book[]>('books', []);
  },

  async getBookBySlug(slug: string): Promise<Book | null> {
    const books = await this.getBooks();
    return books.find((b) => b.slug === slug) || null;
  },

  async saveBook(bookData: Partial<Book>): Promise<Book> {
    const books = await this.getBooks();
    const isNew = !bookData.id || !isValidUuid(bookData.id);
    const id = !isNew && bookData.id ? bookData.id : crypto.randomUUID();

    // Auto-generate and ensure unique slug
    let baseSlug = bookData.slug ? slugify(bookData.slug) : slugify(bookData.title || 'livro');
    if (!baseSlug) baseSlug = 'livro-' + Math.random().toString(36).substring(2, 6);
    let slug = baseSlug;

    // Check for collision with a different book
    const duplicate = books.find((b) => b.slug === slug && b.id !== id);
    if (duplicate) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const priceNum = sanitizeNumber(bookData.price);
    const pageNum = sanitizeNumber(bookData.page_count);

    const newBook: Book = {
      id,
      title: bookData.title?.trim() || 'Sem título',
      slug,
      edition: bookData.edition?.trim() || '',
      description: bookData.description?.trim() || '',
      short_description: bookData.short_description?.trim() || '',
      genre: bookData.genre?.trim() || 'Ficção Literária',
      price: priceNum !== null ? priceNum : null,
      page_count: pageNum !== null ? Math.round(pageNum) : null,
      cover_url: bookData.cover_url?.trim() || '',
      store_url: bookData.store_url?.trim() || '',
      status: bookData.status || 'Em desenvolvimento',
      progress: Math.min(100, Math.max(0, Number(bookData.progress) || 0)),
      publication_date: sanitizeDate(bookData.publication_date) || '',
      featured: Boolean(bookData.featured),
      is_demo: Boolean(bookData.is_demo),
      created_at: bookData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stages: bookData.stages || []
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      // Clean record for Supabase PostgreSQL (dates as null instead of empty strings)
      const cleanDbBook = {
        id: newBook.id,
        title: newBook.title,
        slug: newBook.slug,
        edition: newBook.edition || null,
        description: newBook.description,
        short_description: newBook.short_description || null,
        genre: newBook.genre,
        price: newBook.price,
        page_count: newBook.page_count,
        cover_url: newBook.cover_url || null,
        store_url: newBook.store_url || null,
        status: newBook.status,
        progress: newBook.progress,
        publication_date: sanitizeDate(newBook.publication_date), // NULL if empty string
        featured: newBook.featured,
        is_demo: newBook.is_demo,
        created_at: newBook.created_at,
        updated_at: newBook.updated_at
      };

      const { error } = await supabase.from('books').upsert(cleanDbBook);
      if (error) {
        console.error('Erro ao salvar livro no Supabase:', error.message);
        throw new Error(`Erro ao salvar livro no Supabase: ${error.message}`);
      }

      // Save stages with valid UUIDs
      if (newBook.stages && Array.isArray(newBook.stages) && newBook.stages.length > 0) {
        const formattedStages = newBook.stages.map((s, idx) => ({
          id: isValidUuid(s.id) ? s.id : crypto.randomUUID(),
          book_id: id,
          title: s.title?.trim() || `Etapa ${idx + 1}`,
          description: s.description?.trim() || '',
          status: (['Pendente', 'Em andamento', 'Concluído'].includes(s.status) ? s.status : 'Pendente') as BookStageStatus,
          order_index: idx
        }));

        await supabase.from('book_stages').delete().eq('book_id', id);
        const { error: stageErr } = await supabase.from('book_stages').insert(formattedStages);
        if (stageErr) {
          console.warn('Aviso ao sincronizar etapas do livro:', stageErr.message);
        }
      }
    }

    const localList = getLocal<Book[]>('books', []);
    let updatedList: Book[];
    if (isNew) {
      updatedList = [newBook, ...localList.filter((b) => b.id !== id)];
    } else {
      updatedList = localList.map((b) => (b.id === id ? newBook : b));
    }
    setLocal('books', updatedList);
    return newBook;
  },

  async deleteBook(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('book_stages').delete().eq('book_id', id);
        const { error } = await supabase.from('books').delete().eq('id', id);
        if (error) {
          console.error('Erro ao deletar livro no Supabase:', error.message);
          throw new Error(`Erro ao excluir livro no Supabase: ${error.message}`);
        }
      } catch (err: any) {
        console.error('Erro ao deletar livro no Supabase:', err);
        throw err;
      }
    }
    const books = getLocal<Book[]>('books', []);
    setLocal('books', books.filter((b) => b.id !== id));
  },

  // ===================== PROJECTS =====================
  async getProjects(includePrivate = false): Promise<Project[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (!includePrivate) {
          query = query.eq('is_public', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as Project[];
      } catch (err) {
        console.warn('Erro ao buscar projetos do Supabase:', err);
      }
    }
    const all = getLocal<Project[]>('projects', []);
    return includePrivate ? all : all.filter((p) => p.is_public);
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const projects = await this.getProjects(true);
    return projects.find((p) => p.slug === slug) || null;
  },

  async saveProject(projData: Partial<Project>): Promise<Project> {
    const projects = await this.getProjects(true);
    const isNew = !projData.id || !isValidUuid(projData.id);
    const id = !isNew && projData.id ? projData.id : crypto.randomUUID();

    let baseSlug = projData.slug ? slugify(projData.slug) : slugify(projData.title || 'projeto');
    if (!baseSlug) baseSlug = 'projeto-' + Math.random().toString(36).substring(2, 6);
    let slug = baseSlug;

    const duplicate = projects.find((p) => p.slug === slug && p.id !== id);
    if (duplicate) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const newProject: Project = {
      id,
      title: projData.title?.trim() || 'Sem título',
      slug,
      description: projData.description?.trim() || '',
      genre: projData.genre?.trim() || 'Literatura',
      status: projData.status || 'Em andamento',
      progress: Math.min(100, Math.max(0, Number(projData.progress) || 0)),
      image_url: projData.image_url?.trim() || '',
      start_date: sanitizeDate(projData.start_date) || '',
      expected_release_date: sanitizeDate(projData.expected_release_date) || '',
      is_public: projData.is_public !== undefined ? projData.is_public : true,
      is_demo: Boolean(projData.is_demo),
      created_at: projData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stages: projData.stages || []
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const cleanDbProj = {
        id: newProject.id,
        title: newProject.title,
        slug: newProject.slug,
        description: newProject.description,
        genre: newProject.genre,
        status: newProject.status,
        progress: newProject.progress,
        image_url: newProject.image_url || null,
        start_date: sanitizeDate(newProject.start_date), // NULL if empty string
        expected_release_date: sanitizeDate(newProject.expected_release_date), // NULL if empty string
        is_public: newProject.is_public,
        is_demo: newProject.is_demo,
        created_at: newProject.created_at,
        updated_at: newProject.updated_at
      };

      const { error } = await supabase.from('projects').upsert(cleanDbProj);
      if (error) {
        console.error('Erro ao salvar projeto no Supabase:', error.message);
        throw new Error(`Erro ao salvar projeto no Supabase: ${error.message}`);
      }
    }

    const localList = getLocal<Project[]>('projects', []);
    let updatedList: Project[];
    if (isNew) {
      updatedList = [newProject, ...localList.filter((p) => p.id !== id)];
    } else {
      updatedList = localList.map((p) => (p.id === id ? newProject : p));
    }
    setLocal('projects', updatedList);
    return newProject;
  },

  async deleteProject(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar projeto no Supabase:', error.message);
        throw new Error(`Erro ao excluir projeto no Supabase: ${error.message}`);
      }
    }
    const projects = getLocal<Project[]>('projects', []);
    setLocal('projects', projects.filter((p) => p.id !== id));
  },

  // ===================== UPDATES / DIARY =====================
  async getUpdates(includeDrafts = false, filter?: { bookId?: string; projectId?: string }): Promise<Update[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('updates').select('*').order('created_at', { ascending: false });
        if (!includeDrafts) {
          query = query.eq('published', true);
        }
        if (filter?.bookId) {
          query = query.eq('book_id', filter.bookId);
        }
        if (filter?.projectId) {
          query = query.eq('project_id', filter.projectId);
        }
        const { data, error } = await query;
        if (!error && data) return data as Update[];
      } catch (err) {
        console.warn('Erro ao buscar atualizações do Supabase:', err);
      }
    }

    let all = getLocal<Update[]>('updates', []);
    if (!includeDrafts) {
      all = all.filter((u) => u.published);
    }
    if (filter?.bookId) {
      all = all.filter((u) => u.book_id === filter.bookId);
    }
    if (filter?.projectId) {
      all = all.filter((u) => u.project_id === filter.projectId);
    }
    return all;
  },

  async getUpdateBySlug(slug: string): Promise<Update | null> {
    const updates = await this.getUpdates(true);
    return updates.find((u) => u.slug === slug) || null;
  },

  async saveUpdate(upData: Partial<Update>): Promise<Update> {
    const updates = await this.getUpdates(true);
    const isNew = !upData.id || !isValidUuid(upData.id);
    const id = !isNew && upData.id ? upData.id : crypto.randomUUID();

    let baseSlug = upData.slug ? slugify(upData.slug) : slugify(upData.title || 'atualizacao');
    if (!baseSlug) baseSlug = 'atualizacao-' + Math.random().toString(36).substring(2, 6);
    let slug = baseSlug;

    const duplicate = updates.find((u) => u.slug === slug && u.id !== id);
    if (duplicate) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const cleanBookId = sanitizeUuid(upData.book_id);
    const cleanProjId = sanitizeUuid(upData.project_id);

    const validCategories = ['Escrita', 'Capítulos', 'Ideias', 'Revisão', 'Capa', 'Publicação', 'Desenvolvimento', 'Reflexões'];
    const category = validCategories.includes(upData.category || '') ? (upData.category as any) : 'Escrita';

    const newUpdate: Update = {
      id,
      title: upData.title?.trim() || 'Sem título',
      slug,
      content: upData.content?.trim() || '',
      excerpt: upData.excerpt?.trim() || upData.content?.substring(0, 160) || '',
      image_url: upData.image_url?.trim() || '',
      category,
      book_id: cleanBookId,
      project_id: cleanProjId,
      book_title: upData.book_title || '',
      project_title: upData.project_title || '',
      published: upData.published !== undefined ? upData.published : true,
      is_demo: Boolean(upData.is_demo),
      created_at: upData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const cleanDbUpdate = {
        id: newUpdate.id,
        title: newUpdate.title,
        slug: newUpdate.slug,
        content: newUpdate.content,
        excerpt: newUpdate.excerpt || null,
        image_url: newUpdate.image_url || null,
        category: newUpdate.category,
        book_id: newUpdate.book_id, // NULL if not valid UUID
        project_id: newUpdate.project_id, // NULL if not valid UUID
        published: newUpdate.published,
        is_demo: newUpdate.is_demo,
        created_at: newUpdate.created_at,
        updated_at: newUpdate.updated_at
      };

      const { error } = await supabase.from('updates').upsert(cleanDbUpdate);
      if (error) {
        console.error('Erro ao salvar atualização no Supabase:', error.message);
        throw new Error(`Erro ao salvar atualização no Supabase: ${error.message}`);
      }
    }

    const localList = getLocal<Update[]>('updates', []);
    let updatedList: Update[];
    if (isNew) {
      updatedList = [newUpdate, ...localList.filter((u) => u.id !== id)];
    } else {
      updatedList = localList.map((u) => (u.id === id ? newUpdate : u));
    }
    setLocal('updates', updatedList);
    return newUpdate;
  },

  async deleteUpdate(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.from('updates').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir atualização no Supabase:', error.message);
        throw new Error(`Erro ao excluir atualização: ${error.message}`);
      }
    }
    const updates = getLocal<Update[]>('updates', []);
    setLocal('updates', updates.filter((u) => u.id !== id));
  },

  // ===================== TEXTS =====================
  async getTexts(includeDrafts = false): Promise<TextItem[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('texts').select('*').order('created_at', { ascending: false });
        if (!includeDrafts) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as TextItem[];
      } catch (err) {
        console.warn('Erro ao buscar textos do Supabase:', err);
      }
    }
    const all = getLocal<TextItem[]>('texts', []);
    return includeDrafts ? all : all.filter((t) => t.published);
  },

  async getTextBySlug(slug: string): Promise<TextItem | null> {
    const texts = await this.getTexts(true);
    return texts.find((t) => t.slug === slug) || null;
  },

  async saveText(textData: Partial<TextItem>): Promise<TextItem> {
    const texts = await this.getTexts(true);
    const isNew = !textData.id || !isValidUuid(textData.id);
    const id = !isNew && textData.id ? textData.id : crypto.randomUUID();

    let baseSlug = textData.slug ? slugify(textData.slug) : slugify(textData.title || 'texto');
    if (!baseSlug) baseSlug = 'texto-' + Math.random().toString(36).substring(2, 6);
    let slug = baseSlug;

    const duplicate = texts.find((t) => t.slug === slug && t.id !== id);
    if (duplicate) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const validCategories = ['Poemas', 'Contos', 'Crônicas', 'Reflexões', 'Fragmentos'];
    const category = validCategories.includes(textData.category || '') ? (textData.category as any) : 'Crônicas';

    const newText: TextItem = {
      id,
      title: textData.title?.trim() || 'Sem título',
      slug,
      content: textData.content?.trim() || '',
      category,
      image_url: textData.image_url?.trim() || '',
      published: textData.published !== undefined ? textData.published : true,
      is_demo: Boolean(textData.is_demo),
      created_at: textData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const cleanDbText = {
        id: newText.id,
        title: newText.title,
        slug: newText.slug,
        content: newText.content,
        category: newText.category,
        image_url: newText.image_url || null,
        published: newText.published,
        is_demo: newText.is_demo,
        created_at: newText.created_at,
        updated_at: newText.updated_at
      };

      const { error } = await supabase.from('texts').upsert(cleanDbText);
      if (error) {
        console.error('Erro ao salvar texto no Supabase:', error.message);
        throw new Error(`Erro ao salvar texto no Supabase: ${error.message}`);
      }
    }

    const localList = getLocal<TextItem[]>('texts', []);
    let updatedList: TextItem[];
    if (isNew) {
      updatedList = [newText, ...localList.filter((t) => t.id !== id)];
    } else {
      updatedList = localList.map((t) => (t.id === id ? newText : t));
    }
    setLocal('texts', updatedList);
    return newText;
  },

  async deleteText(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.from('texts').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir texto no Supabase:', error.message);
        throw new Error(`Erro ao excluir texto: ${error.message}`);
      }
    }
    const texts = getLocal<TextItem[]>('texts', []);
    setLocal('texts', texts.filter((t) => t.id !== id));
  },

  // ===================== TIMELINE =====================
  async getTimeline(includeDrafts = false): Promise<TimelineEvent[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('timeline').select('*').order('order_index', { ascending: true });
        if (!includeDrafts) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as TimelineEvent[];
      } catch (err) {
        console.warn('Erro ao buscar timeline do Supabase:', err);
      }
    }
    const all = getLocal<TimelineEvent[]>('timeline', []);
    const sorted = [...all].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    return includeDrafts ? sorted : sorted.filter((ev) => ev.published);
  },

  async saveTimelineEvent(eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const list = await this.getTimeline(true);
    const isNew = !eventData.id || !isValidUuid(eventData.id);
    const id = !isNew && eventData.id ? eventData.id : crypto.randomUUID();

    const cleanDate = sanitizeDate(eventData.event_date) || new Date().toISOString().split('T')[0];

    const newEvent: TimelineEvent = {
      id,
      title: eventData.title?.trim() || 'Marco Literário',
      description: eventData.description?.trim() || '',
      event_date: cleanDate,
      image_url: eventData.image_url?.trim() || '',
      order_index: eventData.order_index !== undefined ? Number(eventData.order_index) : list.length,
      published: eventData.published !== undefined ? eventData.published : true,
      is_demo: Boolean(eventData.is_demo),
      created_at: eventData.created_at || new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const cleanDbEvent = {
        id: newEvent.id,
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.event_date,
        image_url: newEvent.image_url || null,
        order_index: newEvent.order_index,
        published: newEvent.published,
        is_demo: newEvent.is_demo,
        created_at: newEvent.created_at
      };

      const { error } = await supabase.from('timeline').upsert(cleanDbEvent);
      if (error) {
        console.error('Erro ao salvar evento da timeline:', error.message);
        throw new Error(`Erro ao salvar marco na timeline: ${error.message}`);
      }
    }

    const localList = getLocal<TimelineEvent[]>('timeline', []);
    let updatedList: TimelineEvent[];
    if (isNew) {
      updatedList = [...localList.filter((e) => e.id !== id), newEvent];
    } else {
      updatedList = localList.map((ev) => (ev.id === id ? newEvent : ev));
    }
    setLocal('timeline', updatedList);
    return newEvent;
  },

  async deleteTimelineEvent(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.from('timeline').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir timeline:', error.message);
        throw new Error(`Erro ao excluir marco da timeline: ${error.message}`);
      }
    }
    const list = getLocal<TimelineEvent[]>('timeline', []);
    setLocal('timeline', list.filter((e) => e.id !== id));
  },

  // ===================== GALLERY =====================
  async getGallery(includeDrafts = false): Promise<GalleryItem[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (!includeDrafts) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as GalleryItem[];
      } catch (err) {
        console.warn('Erro ao carregar galeria do Supabase:', err);
      }
    }
    const all = getLocal<GalleryItem[]>('gallery', []);
    return includeDrafts ? all : all.filter((g) => g.published);
  },

  async saveGalleryItem(gData: Partial<GalleryItem>): Promise<GalleryItem> {
    const list = await this.getGallery(true);
    const isNew = !gData.id || !isValidUuid(gData.id);
    const id = !isNew && gData.id ? gData.id : crypto.randomUUID();

    const cleanBookId = sanitizeUuid(gData.book_id);
    const cleanProjId = sanitizeUuid(gData.project_id);

    const validCategories = ['Capas', 'Conceitos', 'Ilustrações', 'Fotografias', 'Outros'];
    const category = validCategories.includes(gData.category || '') ? (gData.category as any) : 'Conceitos';

    const newItem: GalleryItem = {
      id,
      title: gData.title?.trim() || 'Arte / Fotografia',
      description: gData.description?.trim() || '',
      image_url: gData.image_url?.trim() || '',
      category,
      book_id: cleanBookId,
      project_id: cleanProjId,
      book_title: gData.book_title || '',
      project_title: gData.project_title || '',
      published: gData.published !== undefined ? gData.published : true,
      is_demo: Boolean(gData.is_demo),
      created_at: gData.created_at || new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const cleanDbItem = {
        id: newItem.id,
        title: newItem.title,
        description: newItem.description || null,
        image_url: newItem.image_url,
        category: newItem.category,
        book_id: newItem.book_id, // NULL if empty string
        project_id: newItem.project_id, // NULL if empty string
        published: newItem.published,
        is_demo: newItem.is_demo,
        created_at: newItem.created_at
      };

      const { error } = await supabase.from('gallery').upsert(cleanDbItem);
      if (error) {
        console.error('Erro ao salvar item na galeria:', error.message);
        throw new Error(`Erro ao salvar na galeria: ${error.message}`);
      }
    }

    const localList = getLocal<GalleryItem[]>('gallery', []);
    let updatedList: GalleryItem[];
    if (isNew) {
      updatedList = [newItem, ...localList.filter((g) => g.id !== id)];
    } else {
      updatedList = localList.map((g) => (g.id === id ? newItem : g));
    }
    setLocal('gallery', updatedList);
    return newItem;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir item da galeria:', error.message);
        throw new Error(`Erro ao excluir imagem da galeria: ${error.message}`);
      }
    }
    const list = getLocal<GalleryItem[]>('gallery', []);
    setLocal('gallery', list.filter((g) => g.id !== id));
  },

  // ===================== ACADEMIC (FORMAÇÃO, CURSOS & PESQUISA) =====================
  async getAcademicItems(includeDrafts = false): Promise<AcademicItem[]> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('academic_items').select('*').order('order_index', { ascending: true });
        if (!includeDrafts) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as AcademicItem[];
        }
      } catch (err) {
        console.warn('Tabela academic_items ainda não consultável no Supabase, usando armazenamento local:', err);
      }
    }
    const all = getLocal<AcademicItem[]>('academic_items', DEFAULT_ACADEMIC_ITEMS);
    const sorted = [...all].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    return includeDrafts ? sorted : sorted.filter((it) => it.published);
  },

  async saveAcademicItem(itemData: Partial<AcademicItem>): Promise<AcademicItem> {
    const list = await this.getAcademicItems(true);
    const isNew = !itemData.id || !isValidUuid(itemData.id);
    const id = !isNew && itemData.id ? itemData.id : crypto.randomUUID();

    const validTypes: AcademicType[] = ['Formação', 'Curso & Oficina', 'Artigo & Pesquisa', 'Palestra & Docência', 'Certificação'];
    const type = validTypes.includes(itemData.type as any) ? (itemData.type as AcademicType) : 'Curso & Oficina';

    const validStatuses: AcademicStatus[] = ['Concluído', 'Em andamento', 'Interrompido'];
    const status = validStatuses.includes(itemData.status as any) ? (itemData.status as AcademicStatus) : 'Concluído';

    const workload = sanitizeNumber(itemData.workload_hours);

    const newItem: AcademicItem = {
      id,
      title: itemData.title?.trim() || 'Formação / Curso',
      type,
      institution: itemData.institution?.trim() || '',
      degree_level: itemData.degree_level?.trim() || '',
      field_of_study: itemData.field_of_study?.trim() || '',
      start_year: itemData.start_year?.trim() || '',
      end_year: itemData.end_year?.trim() || '',
      status,
      workload_hours: workload !== null ? Math.round(workload) : null,
      description: itemData.description?.trim() || '',
      thesis_title: itemData.thesis_title?.trim() || '',
      advisor: itemData.advisor?.trim() || '',
      certificate_url: itemData.certificate_url?.trim() || '',
      external_link: itemData.external_link?.trim() || '',
      order_index: itemData.order_index !== undefined ? Number(itemData.order_index) : list.length,
      featured: Boolean(itemData.featured),
      published: itemData.published !== undefined ? itemData.published : true,
      is_demo: Boolean(itemData.is_demo),
      created_at: itemData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const cleanDbItem = {
          id: newItem.id,
          title: newItem.title,
          type: newItem.type,
          institution: newItem.institution,
          degree_level: newItem.degree_level || null,
          field_of_study: newItem.field_of_study || null,
          start_year: newItem.start_year || null,
          end_year: newItem.end_year || null,
          status: newItem.status,
          workload_hours: newItem.workload_hours,
          description: newItem.description || null,
          thesis_title: newItem.thesis_title || null,
          advisor: newItem.advisor || null,
          certificate_url: newItem.certificate_url || null,
          external_link: newItem.external_link || null,
          order_index: newItem.order_index,
          featured: newItem.featured,
          published: newItem.published,
          is_demo: newItem.is_demo,
          created_at: newItem.created_at,
          updated_at: newItem.updated_at
        };

        const { error } = await supabase.from('academic_items').upsert(cleanDbItem);
        if (error) {
          console.warn('Aviso: Supabase academic_items não pôde ser gravado remotamente (tabela pode ainda não ter sido criada no editor SQL):', error.message);
        }
      } catch (err) {
        console.warn('Exceção ao sincronizar com Supabase academic_items:', err);
      }
    }

    const localList = getLocal<AcademicItem[]>('academic_items', DEFAULT_ACADEMIC_ITEMS);
    let updatedList: AcademicItem[];
    if (isNew) {
      updatedList = [...localList.filter((it) => it.id !== id), newItem];
    } else {
      updatedList = localList.map((it) => (it.id === id ? newItem : it));
    }
    setLocal('academic_items', updatedList);
    return newItem;
  },

  async deleteAcademicItem(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('academic_items').delete().eq('id', id);
      } catch (err) {
        console.warn('Aviso ao deletar academic_items no Supabase:', err);
      }
    }
    const list = getLocal<AcademicItem[]>('academic_items', DEFAULT_ACADEMIC_ITEMS);
    setLocal('academic_items', list.filter((it) => it.id !== id));
  },

  // ===================== DEMO DATA MANAGEMENT =====================
  loadIdentifiedSampleData(): void {
    const sampleBooks: Book[] = [
      {
        id: 'demo-book-1',
        title: '[Exemplo] O Silêncio das Palavras Ausentes',
        slug: 'exemplo-o-silencio-das-palavras-ausentes',
        edition: '1ª Edição (Exemplo)',
        description: 'Exemplo demonstrativo de sinopse literária. Um romance poético sobre as memórias perdidas e os ecos do tempo em uma cidade esquecida.',
        short_description: 'Um romance poético sobre as memórias perdidas e os ecos do tempo.',
        genre: 'Ficção Literária',
        price: 49.90,
        page_count: 352,
        cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
        store_url: 'https://amazon.com.br',
        status: 'Publicado',
        progress: 100,
        publication_date: '2025-08-15',
        featured: true,
        is_demo: true,
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
        stages: [
          { id: crypto.randomUUID(), book_id: 'demo-book-1', title: 'Planejamento e Estruturação', status: 'Concluído', order_index: 0 },
          { id: crypto.randomUUID(), book_id: 'demo-book-1', title: 'Primeiro Rascunho', status: 'Concluído', order_index: 1 },
          { id: crypto.randomUUID(), book_id: 'demo-book-1', title: 'Revisão Textual Crítica', status: 'Concluído', order_index: 2 },
          { id: crypto.randomUUID(), book_id: 'demo-book-1', title: 'Diagramação e Capa', status: 'Concluído', order_index: 3 },
          { id: crypto.randomUUID(), book_id: 'demo-book-1', title: 'Lançamento Editorial', status: 'Concluído', order_index: 4 }
        ]
      }
    ];

    setLocal('books', sampleBooks);
  },

  clearDemoData(): void {
    const filterOutDemo = <T extends { is_demo?: boolean }>(list: T[]) => list.filter((i) => !i.is_demo);
    setLocal('books', filterOutDemo(getLocal<Book[]>('books', [])));
    setLocal('projects', filterOutDemo(getLocal<Project[]>('projects', [])));
    setLocal('updates', filterOutDemo(getLocal<Update[]>('updates', [])));
    setLocal('texts', filterOutDemo(getLocal<TextItem[]>('texts', [])));
    setLocal('timeline', filterOutDemo(getLocal<TimelineEvent[]>('timeline', [])));
    setLocal('gallery', filterOutDemo(getLocal<GalleryItem[]>('gallery', [])));
    setLocal('academic_items', filterOutDemo(getLocal<AcademicItem[]>('academic_items', DEFAULT_ACADEMIC_ITEMS)));
  }
};
