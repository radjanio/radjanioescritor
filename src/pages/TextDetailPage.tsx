import React, { useState } from 'react';
import { TextItem } from '../types';
import { SEOHead } from '../components/SEOHead';
import { ArrowLeft, Calendar, Share2, Type, Feather } from 'lucide-react';

interface TextDetailPageProps {
  textItem: TextItem | null;
  navigate: (path: string) => void;
}

export const TextDetailPage: React.FC<TextDetailPageProps> = ({ textItem, navigate }) => {
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');

  if (!textItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
          Texto não encontrado
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          O texto literário que você procurou não existe ou foi arquivado.
        </p>
        <button
          onClick={() => navigate('/textos')}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider rounded-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos textos
        </button>
      </div>
    );
  }

  // Calculate reading time
  const words = textItem.content.trim().split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(words / 180));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: textItem.title,
        text: textItem.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const fontSizeClass = {
    base: 'text-base sm:text-lg leading-[1.8]',
    lg: 'text-lg sm:text-xl leading-[1.9]',
    xl: 'text-xl sm:text-2xl leading-[2.0]',
  }[fontSize];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-24 space-y-12">
      <SEOHead
        title={textItem.title}
        description={textItem.content.substring(0, 160)}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <button
          onClick={() => navigate('/textos')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos textos</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Font Size Adjuster */}
          <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-sm p-0.5 bg-stone-100/50 dark:bg-stone-900">
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 text-[10px] font-serif rounded-xs ${fontSize === 'base' ? 'bg-white dark:bg-stone-800 font-bold shadow-xs' : 'text-stone-500'}`}
              title="Fonte Padrão"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 text-xs font-serif rounded-xs ${fontSize === 'lg' ? 'bg-white dark:bg-stone-800 font-bold shadow-xs' : 'text-stone-500'}`}
              title="Fonte Média"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-0.5 text-sm font-serif rounded-xs ${fontSize === 'xl' ? 'bg-white dark:bg-stone-800 font-bold shadow-xs' : 'text-stone-500'}`}
              title="Fonte Grande"
            >
              A++
            </button>
          </div>

          <button
            onClick={handleShare}
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      <header className="space-y-4 text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
          <span className="text-amber-800 dark:text-amber-400 font-semibold">{textItem.category}</span>
          <span aria-hidden="true">·</span>
          <span>{readTimeMin} min de leitura</span>
          <span aria-hidden="true">·</span>
          <time>{new Date(textItem.created_at).toLocaleDateString('pt-BR')}</time>
          {textItem.is_demo && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">[Exemplo]</span>
            </>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.18]">
          {textItem.title}
        </h1>
      </header>

      {/* Image if available */}
      {textItem.image_url && (
        <div className="rounded-sm overflow-hidden aspect-[16/9] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <img
            src={textItem.image_url}
            alt={textItem.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Literary Content Reader */}
      <div className={`font-editorial ${fontSizeClass} text-stone-800 dark:text-stone-200 space-y-6 whitespace-pre-line text-justify-pretty max-w-2xl mx-auto pt-4`}>
        {textItem.content}
      </div>

      {/* Author signature footer */}
      <div className="pt-16 border-t border-stone-200/80 dark:border-stone-800 text-center space-y-2">
        <Feather className="w-5 h-5 text-amber-800 dark:text-amber-500 mx-auto stroke-[1.5]" />
        <p className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
          Radjanio Silva Souza
        </p>
        <p className="text-xs text-stone-500">
          Texto autoral pertencente ao acervo literário do escritor.
        </p>
      </div>
    </article>
  );
};
