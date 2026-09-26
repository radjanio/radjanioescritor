import React from 'react';
import { Book, BookStage, Update } from '../types';
import { SEOHead } from '../components/SEOHead';
import {
  ArrowLeft,
  ShoppingBag,
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  Circle,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface BookDetailPageProps {
  book: Book | null;
  updates: Update[];
  navigate: (path: string) => void;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({ book, updates, navigate }) => {
  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
          Livro não encontrado
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          A obra que você está procurando não existe ou foi removida do catálogo.
        </p>
        <button
          onClick={() => navigate('/livros')}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider rounded-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar à biblioteca
        </button>
      </div>
    );
  }

  // Stages fallback or custom stages from DB
  const stages: BookStage[] = book.stages && book.stages.length > 0 ? book.stages : [
    { id: '1', book_id: book.id, title: 'Planejamento e Pesquisa', description: 'Definição do escopo e pesquisa histórica/temática', status: book.progress >= 20 ? 'Concluído' : 'Em andamento', order_index: 0 },
    { id: '2', book_id: book.id, title: 'Escrita do Manuscrito', description: 'Redação ativa de capítulos e diálogos', status: book.progress >= 50 ? 'Concluído' : (book.progress >= 20 ? 'Em andamento' : 'Pendente'), order_index: 1 },
    { id: '3', book_id: book.id, title: 'Revisão Crítica e Textual', description: 'Leitura crítica, revisão gramatical e polimento', status: book.progress >= 75 ? 'Concluído' : (book.progress >= 50 ? 'Em andamento' : 'Pendente'), order_index: 2 },
    { id: '4', book_id: book.id, title: 'Projeto Gráfico & Capa', description: 'Tipografia, diagramação e identidade visual', status: book.progress >= 90 ? 'Concluído' : (book.progress >= 75 ? 'Em andamento' : 'Pendente'), order_index: 3 },
    { id: '5', book_id: book.id, title: 'Publicação Editorial', description: 'Distribuição, impressão e venda online', status: book.progress >= 100 ? 'Concluído' : (book.progress >= 90 ? 'Em andamento' : 'Pendente'), order_index: 4 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      <SEOHead
        title={book.title}
        description={book.short_description || book.description.substring(0, 160)}
      />

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/livros')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para livros</span>
        </button>
      </div>

      {/* Hero Book presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Cover presentation */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[2/3] rounded-sm overflow-hidden bg-stone-200 dark:bg-stone-900 shadow-xl border border-stone-200/60 dark:border-stone-800">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-stone-400">
                <BookOpen className="w-16 h-16 mb-4 stroke-[1.2] text-amber-800/60 dark:text-amber-500/60" />
                <h3 className="font-serif text-xl font-medium text-stone-800 dark:text-stone-200">
                  {book.title}
                </h3>
                <span className="text-xs mt-2 text-stone-500">Capa em produção</span>
              </div>
            )}
            {book.is_demo && (
              <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-stone-900/80 text-stone-200 backdrop-blur-xs rounded-xs">
                Exemplo
              </span>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="text-amber-800 dark:text-amber-400 font-semibold">{book.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">{book.status}</span>
            {book.page_count && (
              <>
                <span aria-hidden="true">·</span>
                <span>{book.page_count} páginas</span>
              </>
            )}
            {book.edition && (
              <>
                <span aria-hidden="true">·</span>
                <span>{book.edition}</span>
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
            {book.title}
          </h1>

          {/* Pricing & Publication date */}
          <div className="flex flex-wrap items-center gap-6 py-2 border-y border-stone-200 dark:border-stone-800 text-sm">
            {book.price ? (
              <div>
                <span className="text-xs text-stone-500 block">Preço</span>
                <span className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  R$ {Number(book.price).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ) : null}

            {book.publication_date && (
              <div>
                <span className="text-xs text-stone-500 block">Data de Publicação</span>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  {book.publication_date}
                </span>
              </div>
            )}

            <div>
              <span className="text-xs text-stone-500 block">Status Editorial</span>
              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {book.status}
              </span>
            </div>

            {book.page_count && (
              <div>
                <span className="text-xs text-stone-500 block">Extensão</span>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  {book.page_count} páginas
                </span>
              </div>
            )}
          </div>

          {/* Full description */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100">
              Sinopse &amp; Apresentação
            </h3>
            <div className="font-editorial text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line text-justify-pretty">
              {book.description}
            </div>
          </div>

          {/* Purchase Button */}
          {book.store_url ? (
            <div className="pt-4">
              <a
                href={book.store_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-sm bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Comprar livro na loja oficial</span>
              </a>
            </div>
          ) : (
            <div className="pt-2">
              <p className="text-xs text-stone-500 italic">
                Link para compra estará disponível assim que as vendas forem abertas pelo autor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= PROCESSO & ETAPAS DO LIVRO ================= */}
      <section className="p-8 sm:p-10 bg-stone-100/60 dark:bg-stone-900/40 rounded-sm border border-stone-200/80 dark:border-stone-800 space-y-8">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
            Transparência Criativa
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Progresso &amp; Etapas do Projeto
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-stone-700 dark:text-stone-300">
              Desenvolvimento Global da Obra
            </span>
            <span className="font-serif text-base font-bold text-amber-900 dark:text-amber-400">
              {book.progress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-800 dark:bg-amber-500 transition-all duration-700"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
          {stages.map((stg, idx) => {
            const isDone = stg.status === 'Concluído';
            const isCurrent = stg.status === 'Em andamento';
            return (
              <div
                key={stg.id || idx}
                className={`p-4 rounded-sm border transition-all ${
                  isDone
                    ? 'bg-white dark:bg-stone-950 border-emerald-500/30 text-stone-800 dark:text-stone-200'
                    : isCurrent
                    ? 'bg-white dark:bg-stone-950 border-amber-500 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'bg-stone-100/50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-xs">
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-stone-400" />
                  )}
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {stg.status}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-semibold leading-snug">
                  {stg.title}
                </h4>
                {stg.description && (
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    {stg.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= ATUALIZAÇÕES RELACIONADAS AO LIVRO ================= */}
      <section className="space-y-6">
        <div className="pb-3 border-b border-stone-200 dark:border-stone-800">
          <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
            Diário de Bordo
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Atualizações Deste Livro
          </h2>
        </div>

        {updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((up) => (
              <article
                key={up.id}
                onClick={() => navigate(`/escrita/${up.slug}`)}
                className="group cursor-pointer p-6 rounded-sm bg-white dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="text-amber-800 dark:text-amber-400 font-medium">{up.category}</span>
                    <span aria-hidden="true">·</span>
                    <time>{new Date(up.created_at).toLocaleDateString('pt-BR')}</time>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">
                    {up.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-editorial line-clamp-2">
                    {up.excerpt || up.content}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900 dark:text-amber-400 font-semibold group-hover:translate-x-1 transition-transform self-end md:self-center">
                  <span>Ler anotação</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-sm">
            <p className="font-serif text-base text-stone-700 dark:text-stone-300">
              Nenhuma atualização registrada especificamente para este livro ainda.
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Novas notas e rascunhos de bastidores serão adicionados conforme a escrita progride.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
