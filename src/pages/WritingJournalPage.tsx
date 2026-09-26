import React, { useState, useMemo } from 'react';
import { Update, UpdateCategory } from '../types';
import { SEOHead } from '../components/SEOHead';
import { EmptyState } from '../components/EmptyState';
import { Feather, Calendar, BookOpen, ArrowRight, Search } from 'lucide-react';

interface WritingJournalPageProps {
  updates: Update[];
  navigate: (path: string) => void;
  authorName?: string;
  authorPhoto?: string;
}

export const WritingJournalPage: React.FC<WritingJournalPageProps> = ({
  updates,
  navigate,
  authorName = 'Radjanio Silva Souza',
  authorPhoto,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'Todas',
    'Escrita',
    'Capítulos',
    'Ideias',
    'Revisão',
    'Capa',
    'Publicação',
    'Desenvolvimento',
    'Reflexões',
  ];

  const filteredUpdates = useMemo(() => {
    return updates.filter((item) => {
      const matchCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [updates, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <SEOHead
        title="Diário de Escrita"
        description="Acompanhe os bastidores do processo criativo, reflexões e registros de escrita de Radjanio Silva Souza."
      />

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
          Processo Criativo &amp; Bastidores
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Diário de Escrita
        </h1>
        <p className="font-editorial text-base sm:text-lg text-stone-600 dark:text-stone-300">
          Anotações do ofício, fragmentos de capítulos, impasses da revisão e a evolução diária dos manuscritos.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar anotações no diário..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm text-xs focus:outline-none focus:border-amber-600 dark:focus:border-amber-400 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
        </div>

        {/* Category segment control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/50 dark:bg-stone-900/60 rounded-md border border-stone-200 dark:border-stone-800">
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
      </div>

      {/* Updates Stream */}
      {filteredUpdates.length > 0 ? (
        <div className="space-y-8">
          {filteredUpdates.map((item) => (
            <article
              key={item.id}
              onClick={() => navigate(`/escrita/${item.slug}`)}
              className="group cursor-pointer bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 rounded-sm p-6 sm:p-8 hover:border-stone-400 dark:hover:border-stone-700 transition-all flex flex-col md:flex-row gap-6 items-start"
            >
              {item.image_url && (
                <div className="w-full md:w-56 shrink-0 aspect-[16/10] md:aspect-square rounded-sm overflow-hidden bg-stone-100 dark:bg-stone-950">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="text-amber-800 dark:text-amber-400 font-semibold">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <time className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                  {(item.book_title || item.project_title) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-600 dark:text-stone-400 font-medium">
                        Ref: {item.book_title || item.project_title}
                      </span>
                    </>
                  )}
                  {item.is_demo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-400">[Exemplo]</span>
                    </>
                  )}
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {item.title}
                </h2>

                <p className="font-editorial text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {item.excerpt || item.content}
                </p>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 flex items-center justify-center">
                      {authorPhoto ? (
                        <img src={authorPhoto} alt={authorName} className="w-full h-full object-cover" />
                      ) : (
                        <Feather className="w-3 h-3 text-stone-500" />
                      )}
                    </div>
                    <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                      {authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Ler anotação</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma publicação encontrada no diário"
          description={
            searchQuery
              ? `Não foram encontradas anotações contendo "${searchQuery}".`
              : selectedCategory === 'Todas'
              ? 'O diário de escrita ainda não possui publicações cadastradas. Anotações sobre processos e capítulos serão compartilhadas aqui.'
              : `Não há anotações na categoria "${selectedCategory}".`
          }
          icon="feather"
        />
      )}
    </div>
  );
};
