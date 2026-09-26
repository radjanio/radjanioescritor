export type BookStatus = 'Publicado' | 'Em desenvolvimento' | 'Em breve' | 'Finalizado';

export type BookStageStatus = 'Pendente' | 'Em andamento' | 'Concluído';

export interface BookStage {
  id: string;
  book_id: string;
  title: string;
  description?: string;
  status: BookStageStatus;
  order_index: number;
  created_at?: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  edition?: string;
  description: string;
  short_description?: string;
  genre: string;
  price?: number | null;
  page_count?: number | null;
  cover_url?: string;
  store_url?: string;
  status: BookStatus;
  progress: number; // 0 to 100
  publication_date?: string;
  featured: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
  stages?: BookStage[];
}

export interface ProjectStage {
  id: string;
  title: string;
  status: BookStageStatus;
  order_index: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  status: string;
  progress: number;
  image_url?: string;
  start_date?: string;
  expected_release_date?: string;
  is_public: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
  stages?: ProjectStage[];
}

export type UpdateCategory = 
  | 'Escrita'
  | 'Capítulos'
  | 'Ideias'
  | 'Revisão'
  | 'Capa'
  | 'Publicação'
  | 'Desenvolvimento'
  | 'Reflexões';

export interface Update {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  category: UpdateCategory;
  book_id?: string | null;
  project_id?: string | null;
  book_title?: string;
  project_title?: string;
  published: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export type TextCategory = 
  | 'Poemas'
  | 'Contos'
  | 'Crônicas'
  | 'Reflexões'
  | 'Fragmentos';

export interface TextItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: TextCategory;
  image_url?: string;
  published: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string;
  order_index: number;
  published: boolean;
  is_demo?: boolean;
  created_at: string;
}

export type GalleryCategory = 'Capas' | 'Conceitos' | 'Ilustrações' | 'Fotografias' | 'Outros';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category: GalleryCategory;
  book_id?: string | null;
  project_id?: string | null;
  book_title?: string;
  project_title?: string;
  published: boolean;
  is_demo?: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  author_name: string;
  biography: string;
  author_photo_url?: string;
  author_quote: string;
  email: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}
