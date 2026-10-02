import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  slug?: string;
  subpage?: string;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizeAdminSubpage(sub?: string): string {
  if (!sub) return 'dashboard';
  const clean = normalizeString(sub);
  if (clean === 'atualizacoes' || clean === 'atualizacao' || clean === 'updates' || clean === 'diario') {
    return 'atualizacoes';
  }
  if (clean === 'livros' || clean === 'livro' || clean === 'books') {
    return 'livros';
  }
  if (clean === 'projetos' || clean === 'projeto' || clean === 'projects') {
    return 'projetos';
  }
  if (clean === 'textos' || clean === 'texto' || clean === 'texts') {
    return 'textos';
  }
  if (clean === 'timeline' || clean === 'linha-do-tempo' || clean === 'linhadotempo') {
    return 'timeline';
  }
  if (clean === 'galeria' || clean === 'gallery' || clean === 'fotos') {
    return 'galeria';
  }
  if (clean === 'academico' || clean === 'formacao' || clean === 'cursos' || clean === 'academic') {
    return 'academico';
  }
  if (clean === 'configuracoes' || clean === 'configuracao' || clean === 'settings' || clean === 'config') {
    return 'configuracoes';
  }
  if (clean === 'supabase' || clean === 'banco' || clean === 'database' || clean === 'sql') {
    return 'supabase';
  }
  if (clean === 'login') {
    return 'login';
  }
  if (clean === 'dashboard' || clean === 'painel' || clean === 'inicio') {
    return 'dashboard';
  }
  return clean || 'dashboard';
}

export function parsePath(rawPathname: string): RouteState {
  let pathname = rawPathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    // fallback to raw
  }

  // Remove query strings and hashes
  const cleanPath = pathname.split('?')[0].split('#')[0];
  const clean = cleanPath.replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');

  if (!parts[0] || parts[0] === '') {
    return { path: 'home' };
  }

  const primary = normalizeString(parts[0]);
  const secondary = parts[1];

  switch (primary) {
    case 'livros':
      return { path: 'livros', slug: secondary };
    case 'escrita':
    case 'atualizacoes':
    case 'atualizacao':
    case 'diario':
      return { path: 'escrita', slug: secondary };
    case 'projetos':
      return { path: 'projetos', slug: secondary };
    case 'textos':
      return { path: 'textos', slug: secondary };
    case 'timeline':
    case 'linha-do-tempo':
      return { path: 'timeline' };
    case 'galeria':
      return { path: 'galeria' };
    case 'academico':
    case 'formacao':
    case 'cursos':
      return { path: 'academico' };
    case 'sobre':
      return { path: 'sobre' };
    case 'login':
      return { path: 'admin-login' };
    case 'admin': {
      const normSub = normalizeAdminSubpage(secondary);
      if (normSub === 'login') return { path: 'admin-login' };
      return { path: 'admin', subpage: normSub };
    }
    default:
      return { path: 'home' };
  }
}

export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (url: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
      setCurrentPath(url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    pathname: currentPath,
    route: parsePath(currentPath),
    navigate,
  };
}

