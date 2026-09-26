import React from 'react';
import { SiteSettings } from '../types';
import { SEOHead } from '../components/SEOHead';
import { Feather, Mail, Instagram, Facebook, Twitter, Youtube, BookOpen, Compass } from 'lucide-react';

interface AboutPageProps {
  settings: SiteSettings;
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 space-y-16">
      <SEOHead
        title={`Sobre — ${settings.author_name}`}
        description={`Conheça a biografia, trajetória literária e visão artística de ${settings.author_name}.`}
      />

      {/* Main Author Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Photo Column */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-lg">
            {settings.author_photo_url ? (
              <img
                src={settings.author_photo_url}
                alt={settings.author_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-stone-100 dark:bg-stone-900 text-stone-400">
                <Feather className="w-16 h-16 mb-4 stroke-[1.2] text-amber-800/60 dark:text-amber-500/60" />
                <h3 className="font-serif text-lg font-medium text-stone-700 dark:text-stone-300">
                  {settings.author_name}
                </h3>
                <span className="text-xs text-stone-500 mt-1">Autor &amp; Escritor</span>
              </div>
            )}
          </div>

          {/* Social Links below photo */}
          <div className="pt-6 flex items-center gap-3">
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors border border-stone-200 dark:border-stone-800"
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
                className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors border border-stone-200 dark:border-stone-800"
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
                className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors border border-stone-200 dark:border-stone-800"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {settings.youtube_url && (
              <a
                href={settings.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors border border-stone-200 dark:border-stone-800"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio text column */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
              Biografia &amp; Trajetória
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              {settings.author_name}
            </h1>
          </div>

          {settings.author_quote && (
            <blockquote className="font-editorial text-xl sm:text-2xl italic text-stone-700 dark:text-stone-300 border-l-2 border-amber-800 dark:border-amber-500 pl-4 py-1.5 leading-snug">
              "{settings.author_quote}"
            </blockquote>
          )}

          <div className="font-editorial text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-[1.8] space-y-4 whitespace-pre-line text-justify-pretty">
            {settings.biography || (
              <p>
                Radjanio Silva Souza é autor e escritor contemporâneo, dedicado à ficção, narrativas imersivas e à investigação das complexidades humanas através da palavra escrita.
              </p>
            )}
          </div>

          {/* Contact banner */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100">
              Correspondência &amp; Contato Profissional
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Para consultas de imprensa, convites para palestras, direitos autorais e mensagens de leitores:
            </p>
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-400 hover:underline"
              >
                <Mail className="w-4 h-4" />
                <span>{settings.email}</span>
              </a>
            )}
          </div>

          {/* Navigation action buttons */}
          <div className="pt-6 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/livros')}
              className="px-6 py-2.5 rounded-sm bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
            >
              Ver livros publicados
            </button>
            <button
              onClick={() => navigate('/timeline')}
              className="px-6 py-2.5 rounded-sm border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs uppercase tracking-widest font-semibold hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
            >
              Linha do Tempo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
