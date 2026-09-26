import {
  Book,
  BookStage,
  Project,
  Update,
  TextItem,
  TimelineEvent,
  GalleryItem,
  SiteSettings
} from '../types';
import { getSupabase, isSupabaseConfigured } from './supabase';

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
  updated_at: new Date().toISOString()
};

// Local storage keys for pre-Supabase setup or offline buffer
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
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('site_settings')
          .upsert(updated, { onConflict: 'id' });
        if (error) console.error('Erro ao atualizar configurações no Supabase:', error.message);
      } catch (err) {
        console.error('Falha na requisição de settings ao Supabase:', err);
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
            stages: (b.stages || []).sort((x: BookStage, y: BookStage) => x.order_index - y.order_index)
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
    const books = getLocal<Book[]>('books', []);
    const isNew = !bookData.id;
    const id = bookData.id || crypto.randomUUID();
    const slug = bookData.slug ? slugify(bookData.slug) : slugify(bookData.title || 'livro');

    const newBook: Book = {
      id,
      title: bookData.title || 'Sem título',
      slug,
      edition: bookData.edition || '',
      description: bookData.description || '',
      short_description: bookData.short_description || '',
      genre: bookData.genre || 'Ficção',
      price: bookData.price !== undefined ? bookData.price : null,
      page_count: bookData.page_count !== undefined ? (bookData.page_count ? Number(bookData.page_count) : null) : null,
      cover_url: bookData.cover_url || '',
      store_url: bookData.store_url || '',
      status: bookData.status || 'Em desenvolvimento',
      progress: Math.min(100, Math.max(0, Number(bookData.progress) || 0)),
      publication_date: bookData.publication_date || '',
      featured: Boolean(bookData.featured),
      is_demo: Boolean(bookData.is_demo),
      created_at: bookData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stages: bookData.stages || []
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { stages, ...dbBook } = newBook;
        const { error } = await supabase.from('books').upsert(dbBook);
        if (error) console.error('Erro ao salvar livro no Supabase:', error.message);

        // Save stages
        if (stages && stages.length > 0) {
          const formattedStages = stages.map((s, idx) => ({
            ...s,
            id: s.id || crypto.randomUUID(),
            book_id: id,
            order_index: idx
          }));
          await supabase.from('book_stages').delete().eq('book_id', id);
          await supabase.from('book_stages').insert(formattedStages);
        }
      } catch (err) {
        console.error('Falha de rede ao salvar livro:', err);
      }
    }

    let updatedList: Book[];
    if (isNew) {
      updatedList = [newBook, ...books];
    } else {
      updatedList = books.map((b) => (b.id === id ? newBook : b));
    }
    setLocal('books', updatedList);
    return newBook;
  },

  async deleteBook(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('book_stages').delete().eq('book_id', id);
        await supabase.from('books').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao deletar livro no Supabase:', err);
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
    const projects = getLocal<Project[]>('projects', []);
    const isNew = !projData.id;
    const id = projData.id || crypto.randomUUID();
    const slug = projData.slug ? slugify(projData.slug) : slugify(projData.title || 'projeto');

    const newProject: Project = {
      id,
      title: projData.title || 'Sem título',
      slug,
      description: projData.description || '',
      genre: projData.genre || 'Literatura',
      status: projData.status || 'Em andamento',
      progress: Math.min(100, Math.max(0, Number(projData.progress) || 0)),
      image_url: projData.image_url || '',
      start_date: projData.start_date || '',
      expected_release_date: projData.expected_release_date || '',
      is_public: projData.is_public !== undefined ? projData.is_public : true,
      is_demo: Boolean(projData.is_demo),
      created_at: projData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stages: projData.stages || []
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { stages, ...dbProj } = newProject;
        await supabase.from('projects').upsert(dbProj);
      } catch (err) {
        console.error('Erro ao salvar projeto no Supabase:', err);
      }
    }

    let updatedList: Project[];
    if (isNew) {
      updatedList = [newProject, ...projects];
    } else {
      updatedList = projects.map((p) => (p.id === id ? newProject : p));
    }
    setLocal('projects', updatedList);
    return newProject;
  },

  async deleteProject(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao deletar projeto no Supabase:', err);
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
    const updates = getLocal<Update[]>('updates', []);
    const isNew = !upData.id;
    const id = upData.id || crypto.randomUUID();
    const slug = upData.slug ? slugify(upData.slug) : slugify(upData.title || 'atualizacao');

    const newUpdate: Update = {
      id,
      title: upData.title || 'Sem título',
      slug,
      content: upData.content || '',
      excerpt: upData.excerpt || upData.content?.substring(0, 160) || '',
      image_url: upData.image_url || '',
      category: upData.category || 'Escrita',
      book_id: upData.book_id || null,
      project_id: upData.project_id || null,
      book_title: upData.book_title || '',
      project_title: upData.project_title || '',
      published: upData.published !== undefined ? upData.published : true,
      is_demo: Boolean(upData.is_demo),
      created_at: upData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { book_title, project_title, ...dbRecord } = newUpdate;
        await supabase.from('updates').upsert(dbRecord);
      } catch (err) {
        console.error('Erro ao salvar atualização no Supabase:', err);
      }
    }

    let updatedList: Update[];
    if (isNew) {
      updatedList = [newUpdate, ...updates];
    } else {
      updatedList = updates.map((u) => (u.id === id ? newUpdate : u));
    }
    setLocal('updates', updatedList);
    return newUpdate;
  },

  async deleteUpdate(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('updates').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir atualização no Supabase:', err);
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
    const texts = getLocal<TextItem[]>('texts', []);
    const isNew = !textData.id;
    const id = textData.id || crypto.randomUUID();
    const slug = textData.slug ? slugify(textData.slug) : slugify(textData.title || 'texto');

    const newText: TextItem = {
      id,
      title: textData.title || 'Sem título',
      slug,
      content: textData.content || '',
      category: textData.category || 'Crônicas',
      image_url: textData.image_url || '',
      published: textData.published !== undefined ? textData.published : true,
      is_demo: Boolean(textData.is_demo),
      created_at: textData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('texts').upsert(newText);
      } catch (err) {
        console.error('Erro ao salvar texto no Supabase:', err);
      }
    }

    let updatedList: TextItem[];
    if (isNew) {
      updatedList = [newText, ...texts];
    } else {
      updatedList = texts.map((t) => (t.id === id ? newText : t));
    }
    setLocal('texts', updatedList);
    return newText;
  },

  async deleteText(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('texts').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir texto no Supabase:', err);
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
    const list = getLocal<TimelineEvent[]>('timeline', []);
    const isNew = !eventData.id;
    const id = eventData.id || crypto.randomUUID();

    const newEvent: TimelineEvent = {
      id,
      title: eventData.title || 'Marco Literário',
      description: eventData.description || '',
      event_date: eventData.event_date || new Date().toISOString().split('T')[0],
      image_url: eventData.image_url || '',
      order_index: eventData.order_index !== undefined ? eventData.order_index : list.length,
      published: eventData.published !== undefined ? eventData.published : true,
      is_demo: Boolean(eventData.is_demo),
      created_at: eventData.created_at || new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('timeline').upsert(newEvent);
      } catch (err) {
        console.error('Erro ao salvar evento da timeline:', err);
      }
    }

    let updatedList: TimelineEvent[];
    if (isNew) {
      updatedList = [...list, newEvent];
    } else {
      updatedList = list.map((ev) => (ev.id === id ? newEvent : ev));
    }
    setLocal('timeline', updatedList);
    return newEvent;
  },

  async deleteTimelineEvent(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('timeline').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir timeline:', err);
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
    const list = getLocal<GalleryItem[]>('gallery', []);
    const isNew = !gData.id;
    const id = gData.id || crypto.randomUUID();

    const newItem: GalleryItem = {
      id,
      title: gData.title || 'Arte / Fotografia',
      description: gData.description || '',
      image_url: gData.image_url || '',
      category: gData.category || 'Conceitos',
      book_id: gData.book_id || null,
      project_id: gData.project_id || null,
      book_title: gData.book_title || '',
      project_title: gData.project_title || '',
      published: gData.published !== undefined ? gData.published : true,
      is_demo: Boolean(gData.is_demo),
      created_at: gData.created_at || new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { book_title, project_title, ...dbRecord } = newItem;
        await supabase.from('gallery').upsert(dbRecord);
      } catch (err) {
        console.error('Erro ao salvar item na galeria:', err);
      }
    }

    let updatedList: GalleryItem[];
    if (isNew) {
      updatedList = [newItem, ...list];
    } else {
      updatedList = list.map((g) => (g.id === id ? newItem : g));
    }
    setLocal('gallery', updatedList);
    return newItem;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('gallery').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir item da galeria:', err);
      }
    }
    const list = getLocal<GalleryItem[]>('gallery', []);
    setLocal('gallery', list.filter((g) => g.id !== id));
  },

  // ===================== DEMO DATA MANAGEMENT =====================
  // Note: Following rule 27:
  // "Não invente livros, preços ou informações biográficas de Radjanio Silva Souza.
  // Caso seja necessário criar dados de demonstração para testar a interface,
  // deixe-os claramente identificados como dados de exemplo e facilite sua remoção."
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
          { id: 'stg-1', book_id: 'demo-book-1', title: 'Planejamento e Estruturação', status: 'Concluído', order_index: 0 },
          { id: 'stg-2', book_id: 'demo-book-1', title: 'Primeiro Rascunho', status: 'Concluído', order_index: 1 },
          { id: 'stg-3', book_id: 'demo-book-1', title: 'Revisão Textual Crítica', status: 'Concluído', order_index: 2 },
          { id: 'stg-4', book_id: 'demo-book-1', title: 'Diagramação e Capa', status: 'Concluído', order_index: 3 },
          { id: 'stg-5', book_id: 'demo-book-1', title: 'Lançamento Editorial', status: 'Concluído', order_index: 4 }
        ]
      },
      {
        id: 'demo-book-2',
        title: '[Exemplo] Geografia dos Sentimentos',
        slug: 'exemplo-geografia-dos-sentimentos',
        edition: 'Edição Especial (Exemplo)',
        description: 'Coletânea em desenvolvimento que mapeia a solidão contemporânea através de breves crônicas de encontros inesperados.',
        short_description: 'Mapeamento sensível da solidão e dos encontros na modernidade.',
        genre: 'Crônicas & Ensaios',
        price: 42.00,
        page_count: 240,
        cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        store_url: '',
        status: 'Em desenvolvimento',
        progress: 72,
        publication_date: '',
        featured: false,
        is_demo: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        stages: [
          { id: 'stg-21', book_id: 'demo-book-2', title: 'Pesquisa e Argumento', status: 'Concluído', order_index: 0 },
          { id: 'stg-22', book_id: 'demo-book-2', title: 'Escrita dos Capítulos', status: 'Em andamento', order_index: 1 },
          { id: 'stg-23', book_id: 'demo-book-2', title: 'Revisão Editorial', status: 'Pendente', order_index: 2 },
          { id: 'stg-24', book_id: 'demo-book-2', title: 'Projeto Gráfico', status: 'Pendente', order_index: 3 },
          { id: 'stg-25', book_id: 'demo-book-2', title: 'Publicação', status: 'Pendente', order_index: 4 }
        ]
      }
    ];

    const sampleProjects: Project[] = [
      {
        id: 'demo-proj-1',
        title: '[Exemplo de Projeto] Fragmentos de Crepúsculo',
        slug: 'exemplo-projeto-fragmentos-de-crepusculo',
        description: 'Projeto narrativo experimental investigando perspectivas polifônicas da vida urbana à meia-noite.',
        genre: 'Romance Psicológico',
        status: 'Em escrita ativa',
        progress: 64,
        image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
        start_date: '2025-01-10',
        expected_release_date: '2026-11-20',
        is_public: true,
        is_demo: true,
        created_at: new Date(Date.now() - 45 * 86400000).toISOString()
      }
    ];

    const sampleUpdates: Update[] = [
      {
        id: 'demo-up-1',
        title: '[Exemplo] O ritmo da prosa no silêncio da madrugada',
        slug: 'exemplo-o-ritmo-da-prosa',
        excerpt: 'Reflexões sobre a cadência das frases e a busca pelo tom exato de cada cena durante a escrita noturna.',
        content: `A escrita exige um tipo especial de escuta. Não apenas das palavras faladas, mas daquela ressonância interna que vibra quando a frase atinge o compasso exato.\n\nDurante a madrugada, quando os ruídos da cidade arrefecem, as personagens parecem sussurrar com maior clareza. Este registro serve para documentar a busca constante pela economia da linguagem: cortar o excesso para que a essência respire.`,
        category: 'Escrita',
        book_id: 'demo-book-2',
        book_title: '[Exemplo] Geografia dos Sentimentos',
        published: true,
        is_demo: true,
        image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'demo-up-2',
        title: '[Exemplo] Estruturando os capítulos centrais',
        slug: 'exemplo-estruturando-os-capitulos',
        excerpt: 'Notas sobre a arquitetura dos pontos de virada no manuscrito atual.',
        content: `Reorganizar os pontos de virada é como reconstruir a fundação de uma casa sem derrubar o telhado. Hoje concluo a décima segunda versão do esquema dos capítulos centrais.`,
        category: 'Capítulos',
        project_id: 'demo-proj-1',
        project_title: '[Exemplo de Projeto] Fragmentos de Crepúsculo',
        published: true,
        is_demo: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ];

    const sampleTexts: TextItem[] = [
      {
        id: 'demo-txt-1',
        title: '[Exemplo] Elegia para o que não dissemos',
        slug: 'exemplo-elegia-para-o-que-nao-dissemos',
        category: 'Poemas',
        content: `Havia um silêncio suspenso entre a xícara e a mesa,\numa palavra não dita que pesava séculos.\n\nOlhamos a tarde escorrer pelos vidros molhados,\nenquanto a chuva lavava a memória das ruas.\n\nO que ficou por dizer\nhoje habita as margens deste caderno.`,
        published: true,
        is_demo: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'demo-txt-2',
        title: '[Exemplo] O artesão de tempestades',
        slug: 'exemplo-o-artesao-de-tempestades',
        category: 'Crônicas',
        content: `Ele guardava vidros de vento nas prateleiras mais altas do ateliê. Dizia que cada estação do ano soprava em uma tonalidade diferente — o outono com gosto de folha seca e cobre, a primavera com o aroma denso da terra despertando.\n\nNinguém sabia ao certo se era loucura ou poesia. Mas quando abria a porta, a cidade inteira parecia desacelerar para escutar o que o homem tinha a dizer.`,
        published: true,
        is_demo: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ];

    const sampleTimeline: TimelineEvent[] = [
      {
        id: 'demo-tl-1',
        title: '[Exemplo] Primeiros manuscritos e cadernos de estudo',
        description: 'Início das anotações e pesquisas literárias intensivas, consolidando a voz e a temática da escrita.',
        event_date: '2023-03-01',
        order_index: 0,
        published: true,
        is_demo: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-tl-2',
        title: '[Exemplo] Publicação do primeiro título',
        description: 'Lançamento oficial da primeira obra e aproximação com os primeiros leitores.',
        event_date: '2025-08-15',
        order_index: 1,
        published: true,
        is_demo: true,
        created_at: new Date().toISOString()
      }
    ];

    const sampleGallery: GalleryItem[] = [
      {
        id: 'demo-gal-1',
        title: '[Exemplo] Estudo de Capa e Paleta',
        description: 'Exploração cromática e tipográfica para edição especial.',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        category: 'Capas',
        published: true,
        is_demo: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-gal-2',
        title: '[Exemplo] Caderno de Anotações',
        description: 'Registro do processo manual de manuscrito e rascunhos.',
        image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
        category: 'Fotografias',
        published: true,
        is_demo: true,
        created_at: new Date().toISOString()
      }
    ];

    setLocal('books', sampleBooks);
    setLocal('projects', sampleProjects);
    setLocal('updates', sampleUpdates);
    setLocal('texts', sampleTexts);
    setLocal('timeline', sampleTimeline);
    setLocal('gallery', sampleGallery);
  },

  clearDemoData(): void {
    const filterOutDemo = <T extends { is_demo?: boolean }>(list: T[]) => list.filter((i) => !i.is_demo);
    setLocal('books', filterOutDemo(getLocal<Book[]>('books', [])));
    setLocal('projects', filterOutDemo(getLocal<Project[]>('projects', [])));
    setLocal('updates', filterOutDemo(getLocal<Update[]>('updates', [])));
    setLocal('texts', filterOutDemo(getLocal<TextItem[]>('texts', [])));
    setLocal('timeline', filterOutDemo(getLocal<TimelineEvent[]>('timeline', [])));
    setLocal('gallery', filterOutDemo(getLocal<GalleryItem[]>('gallery', [])));
  }
};
