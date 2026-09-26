import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  authorName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, authorName = 'Radjanio Silva Souza' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Livros', path: '/livros' },
    { label: 'Projetos', path: '/projetos' },
    { label: 'Escrita', path: '/escrita' },
    { label: 'Textos', path: '/textos' },
    { label: 'Linha do Tempo', path: '/timeline' },
    { label: 'Galeria', path: '/galeria' },
    { label: 'Sobre', path: '/sobre' },
  ];

  const handleNav = (url: string) => {
    navigate(url);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && (currentPath === '/' || currentPath === '')) return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Author Brand */}
        <button
          onClick={() => handleNav('/')}
          className="text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm"
        >
          <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
            {authorName}
          </span>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400 font-sans -mt-0.5">
            Escritor &amp; Autor
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`relative px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer rounded-xs ${
                  active
                    ? 'text-amber-900 dark:text-amber-300 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[1.5px] bg-amber-800 dark:bg-amber-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions (Mobile toggle only) */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            className="p-2 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-stone-50/98 dark:bg-stone-950/98 backdrop-blur-xl px-5 py-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`text-left px-3 py-2.5 rounded-sm text-sm font-serif tracking-wide transition-colors ${
                    active
                      ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
