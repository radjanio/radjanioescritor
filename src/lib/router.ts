import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  slug?: string;
  subpage?: string;
}

export function parsePath(pathname: string): RouteState {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');

  if (!parts[0] || parts[0] === '') {
    return { path: 'home' };
  }

  const primary = parts[0];
  const secondary = parts[1];

  switch (primary) {
    case 'livros':
      return { path: 'livros', slug: secondary };
    case 'escrita':
      return { path: 'escrita', slug: secondary };
    case 'projetos':
      return { path: 'projetos', slug: secondary };
    case 'textos':
      return { path: 'textos', slug: secondary };
    case 'timeline':
      return { path: 'timeline' };
    case 'galeria':
      return { path: 'galeria' };
    case 'sobre':
      return { path: 'sobre' };
    case 'admin':
      if (secondary === 'login') return { path: 'admin-login' };
      return { path: 'admin', subpage: secondary || 'dashboard' };
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
