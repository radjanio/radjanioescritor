import React from 'react';
import { Update } from '../types';
import { SEOHead } from '../components/SEOHead';
import { ArrowLeft, Calendar, Tag, BookOpen, Share2 } from 'lucide-react';

interface JournalDetailPageProps {
  update: Update | null;
  navigate: (path: string) => void;
}

export const JournalDetailPage: React.FC<JournalDetailPageProps> = ({ update, navigate }) => {
  const [copied, setCopied] = React.useState(false);

  if (!update) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
          Anotação não encontrada
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          A publicação que você tentou acessar não foi localizada.
        </p>
        <button
          onClick={() => navigate('/escrita')}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider rounded-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Diário
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: update.title,
        text: update.excerpt || update.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-10">
      <SEOHead
        title={update.title}
        description={update.excerpt || update.content.substring(0, 160)}
      />

      {/* Navigation & Category */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/escrita')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao diário</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors rounded-sm hover:bg-stone-100 dark:hover:bg-stone-800"
          title="Compartilhar"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied && <span className="text-[11px] text-emerald-600 font-medium">Link copiado!</span>}
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
          <span className="text-amber-800 dark:text-amber-400 font-semibold">{update.category}</span>
          <span aria-hidden="true">·</span>
          <time className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(update.created_at).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
          {update.is_demo && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">[Exemplo]</span>
            </>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
          {update.title}
        </h1>

        {(update.book_title || update.project_title) && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs border border-stone-200 dark:border-stone-800">
              <BookOpen className="w-3 h-3 text-amber-800 dark:text-amber-400" />
              <span>Obra associada: {update.book_title || update.project_title}</span>
            </span>
          </div>
        )}
      </header>

      {/* Hero Image if present */}
      {update.image_url && (
        <div className="rounded-sm overflow-hidden aspect-[16/9] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <img
            src={update.image_url}
            alt={update.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content with Literary Typography */}
      <div className="pt-6 font-editorial text-lg sm:text-xl text-stone-800 dark:text-stone-200 leading-[1.8] space-y-6 whitespace-pre-line text-justify-pretty border-t border-stone-200 dark:border-stone-800">
        {update.content}
      </div>

      {/* Author signature closing */}
      <footer className="pt-10 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
        <span>Radjanio Silva Souza — Diário de Escrita</span>
        <button
          onClick={() => navigate('/escrita')}
          className="hover:underline text-amber-900 dark:text-amber-400 font-medium"
        >
          Outras anotações →
        </button>
      </footer>
    </article>
  );
};
