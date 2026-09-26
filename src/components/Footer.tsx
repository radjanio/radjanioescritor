import React from 'react';
import { SiteSettings } from '../types';
import { Instagram, Facebook, Twitter, Youtube, Mail, Feather, ArrowUp } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, navigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-100/60 dark:bg-stone-950 text-stone-600 dark:text-stone-400 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-stone-200/80 dark:border-stone-800/60">
          {/* Author Quote & Bio snippet */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <Feather className="w-5 h-5 text-amber-800 dark:text-amber-500 stroke-[1.8]" />
              <span className="font-serif text-2xl font-semibold tracking-tight">
                {settings.author_name}
              </span>
            </div>
            {settings.author_quote && (
              <blockquote className="font-editorial text-lg italic text-stone-700 dark:text-stone-300 border-l-2 border-amber-800/50 dark:border-amber-500/50 pl-4 py-1 leading-snug">
                "{settings.author_quote}"
              </blockquote>
            )}
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
              Site oficial do autor. Espaço dedicado à publicação de obras, crônicas, bastidores da escrita e registros da jornada criativa.
            </p>
          </div>

          {/* Site Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-200">
              Explorar
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/livros')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Biblioteca de Livros
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/projetos')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Projetos Literários
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/escrita')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Diário de Escrita
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/textos')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Textos &amp; Ensaios
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/timeline')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Linha do Tempo
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/sobre')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Sobre o Autor
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-200">
              Contato &amp; Redes
            </h4>
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 text-xs text-amber-900 dark:text-amber-400 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{settings.email}</span>
              </a>
            )}

            <div className="flex items-center gap-3 pt-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-stone-200/70 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              onClick={scrollToTop}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Voltar ao topo</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 space-y-3 sm:space-y-0">
          <p>© {currentYear} {settings.author_name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Plataforma Literária Oficial</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
