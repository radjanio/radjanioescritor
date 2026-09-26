import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'radjanio_supabase_url';
const STORAGE_KEY_KEY = 'radjanio_supabase_anon_key';

// Official project reference and URL extracted from the author's Supabase key
export const OFFICIAL_PROJECT_REF = 'hxkidwascnzkytzktxdu';
export const OFFICIAL_PROJECT_URL = `https://${OFFICIAL_PROJECT_REF}.supabase.co`;
export const OFFICIAL_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a2lkd2FzY256a3l0emt0eGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjE3MDAsImV4cCI6MjA4Njg5NzcwMH0.hQNSaN2JUmzxtP-P_uCOL-lGtv5xZjuuzReVllRV1Z0';

function extractRefFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed.ref === 'string') {
        return parsed.ref;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function normalizeSupabaseUrl(rawUrl: string, anonKey: string = ''): string {
  // If a valid Supabase anon JWT is present, always bind directly to its embedded ref
  if (anonKey) {
    const jwtRef = extractRefFromJwt(anonKey);
    if (jwtRef) {
      return `https://${jwtRef}.supabase.co`;
    }
  }

  const clean = (rawUrl || '').trim();

  // Fix old typo hostname if present
  if (clean.includes('hxkidwascznkytztxdu')) {
    return OFFICIAL_PROJECT_URL;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean.replace(/\/+$/, '');
  }

  if (clean && !clean.includes('/') && !clean.includes(' ') && !clean.startsWith('sb_')) {
    return `https://${clean}.supabase.co`;
  }

  return OFFICIAL_PROJECT_URL;
}

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  let storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  const rawKey = (storedKey || envKey || OFFICIAL_ANON_KEY).trim();

  // If local storage has the typo URL, migrate it immediately
  if (typeof window !== 'undefined' && storedUrl.includes('hxkidwascznkytztxdu')) {
    storedUrl = OFFICIAL_PROJECT_URL;
    localStorage.setItem(STORAGE_KEY_URL, OFFICIAL_PROJECT_URL);
  }

  const rawUrl = (storedUrl || envUrl || OFFICIAL_PROJECT_URL).trim();
  const finalUrl = normalizeSupabaseUrl(rawUrl, rawKey);

  return {
    url: finalUrl,
    anonKey: rawKey,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    const cleanKey = anonKey.trim();
    const cleanUrl = normalizeSupabaseUrl(url, cleanKey);
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    supabaseInstance = null; // reset cached instance
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    supabaseInstance = null;
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();

  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.error('Falha ao inicializar cliente Supabase:', e);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

/**
 * Uploads a file to the Supabase Storage bucket 'author-assets'.
 * Falls back to local object URL / base64 if Supabase is not yet connected.
 */
export async function uploadAsset(file: File, folder: string = 'media'): Promise<string> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('author-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Erro ao enviar para o Supabase Storage:', error.message);
        return await fileToDataUrl(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from('author-assets')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Exceção no upload para Supabase:', err);
      return await fileToDataUrl(file);
    }
  }

  return await fileToDataUrl(file);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
