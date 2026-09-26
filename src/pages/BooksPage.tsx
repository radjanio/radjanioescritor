import React, { useState, useMemo } from 'react';
import { Book, BookStatus } from '../types';
import { SEOHead } from '../components/SEOHead';
import { EmptyState } from '../components/EmptyState';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface BooksPageProps {
  books: Book[];
  navigate: (path: string) => void;
}

type FilterOption = 'Todos' | BookStatus;

export const BooksPage: React.FC<BooksPageProps> = ({ books, navigate }) => {
  const [filter, setFilter] = useState<FilterOption>('Todos');

  const filterOptions: FilterOption[] = [
    'Todos',
    'Publicados' as any,
    'Em desenvolvimento',
    'Em breve',
    'Finalizados' as any,
  ];

  const filteredBooks = useMemo(() => {
    if (filter === 'Todos') return books;
    if ((filter as string) === 'Publicados') {
      return books.filter((b) => b.status === 'Publicado');
    }
    if ((filter as string) === 'Finalizados') {
      return books.filter((b) => b.status === 'Finalizado');
    }
    return books.filter((b) => b.status === filter);
  }, [books, filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <SEOHead
        title="Biblioteca de Livros"
        description="Conheça todos os livros, obras publicadas e títulos em desenvolvimento de Radjanio Silva Souza."
      />

      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
          Catálogo &amp; Acervo
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Biblioteca de Livros
        </h1>
        <p className="font-editorial text-base sm:text-lg text-stone-600 dark:text-stone-300">
          Obras publicadas, edições especiais e manuscritos em desenvolvimento por Radjanio Silva Souza.
        </p>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/50 dark:bg-stone-900/60 rounded-md max-w-fit border border-stone-200 dark:border-stone-800">
        {filterOptions.map((opt) => {
          const isActive = filter === opt;
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="group bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-sm overflow-hidden flex flex-col justify-between hover:border-stone-400 dark:hover:border-stone-700 transition-all shadow-xs hover:shadow-md"
            >
              <div>
                {/* Book Cover Container */}
                <div
                  onClick={() => navigate(`/livros/${book.slug}`)}
                  className="cursor-pointer relative aspect-[16/10] sm:aspect-[3/2] overflow-hidden bg-stone-100 dark:bg-stone-950 flex items-center justify-center border-b border-stone-200/60 dark:border-stone-800/80"
                >
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-stone-400">
                      <BookOpen className="w-10 h-10 mb-2 stroke-[1.2] text-amber-800/60 dark:text-amber-500/60" />
                      <span className="font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                        {book.title}
                      </span>
                    </div>
                  )}

                  {book.is_demo && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-stone-900/80 text-stone-200 backdrop-blur-xs rounded-xs">
                      Exemplo
                    </span>
                  )}

                  {book.featured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-amber-800/90 text-amber-100 backdrop-blur-xs rounded-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Destaque
                    </span>
                  )}
                </div>

                {/* Metadata & Title */}
                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="text-amber-800 dark:text-amber-400 font-medium">{book.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.status}</span>
                    {book.page_count && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{book.page_count} págs.</span>
                      </>
                    )}
                    {book.edition && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{book.edition}</span>
                      </>
                    )}
                  </div>

                  <h3
                    onClick={() => navigate(`/livros/${book.slug}`)}
                    className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                  >
                    {book.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed font-editorial">
                    {book.short_description || book.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Price & CTA */}
              <div className="p-6 pt-0 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
                <div>
                  {book.price ? (
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      R$ {Number(book.price).toFixed(2).replace('.', ',')}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500">Em preparação</span>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/livros/${book.slug}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  <span>Ver livro</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum livro cadastrado nesta categoria"
          description={
            filter === 'Todos'
              ? 'Nenhum livro foi cadastrado ainda no acervo do autor. Obras e lançamentos oficiais serão publicados em breve.'
              : `Não há títulos cadastrados com o status "${filter}".`
          }
          icon="book"
        />
      )}
    </div>
  );
};
