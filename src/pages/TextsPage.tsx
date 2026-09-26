import React, { useState, useMemo } from 'react';
import { TextItem, TextCategory } from '../types';
import { SEOHead } from '../components/SEOHead';
import { EmptyState } from '../components/EmptyState';
import { Feather, Calendar, ArrowRight } from 'lucide-react';

interface TextsPageProps {
  texts: TextItem[];
  navigate: (path: string) => void;
}

export const TextsPage: React.FC<TextsPageProps> = ({ texts, navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Poemas', 'Contos', 'Crônicas', 'Reflexões', 'Fragmentos'];

  const filteredTexts = useMemo(() => {
    if (selectedCategory === 'Todos') return texts;
    return texts.filter((t) => t.category === selectedCategory);
  }, [texts, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <SEOHead
        title="Textos Autorais"
        description="Crônicas, poemas, contos e ensaios literários escritos por Radjanio Silva Souza."
      />

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
          Ensaios, Poemas &amp; Crônicas
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Textos &amp; Prosa Avulsa
        </h1>
        <p className="font-editorial text-base sm:text-lg text-stone-600 dark:text-stone-300">
          Escritas independentes, investigações poéticas e narrativas curtas de Radjanio Silva Souza.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/50 dark:bg-stone-900/60 rounded-md max-w-fit border border-stone-200 dark:border-stone-800">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Texts List */}
      {filteredTexts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTexts.map((item) => (
            <article
              key={item.id}
              onClick={() => navigate(`/textos/${item.slug}`)}
              className="group cursor-pointer bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 rounded-sm p-6 sm:p-8 hover:border-stone-400 dark:hover:border-stone-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="text-amber-800 dark:text-amber-400 font-semibold">{item.category}</span>
                  <time>{new Date(item.created_at).toLocaleDateString('pt-BR')}</time>
                </div>

                <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {item.title}
                </h2>

                <p className="font-editorial text-sm text-stone-600 dark:text-stone-400 line-clamp-4 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                {item.is_demo && (
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest">[Exemplo]</span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-400 group-hover:translate-x-1 transition-transform ml-auto">
                  <span>Ler texto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum texto cadastrado nesta categoria"
          description={
            selectedCategory === 'Todos'
              ? 'Não há textos publicados no momento. Poemas, contos e crônicas autorais serão divulgados em breve.'
              : `Ainda não existem publicações sob a categoria "${selectedCategory}".`
          }
          icon="feather"
        />
      )}
    </div>
  );
};
