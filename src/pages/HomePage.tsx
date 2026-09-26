import React from 'react';
import { Book, Project, Update, SiteSettings } from '../types';
import { SEOHead } from '../components/SEOHead';
import { BookOpen, Feather, ArrowRight, Sparkles, Clock, Compass, Layers, CheckCircle } from 'lucide-react';

interface HomePageProps {
  settings: SiteSettings;
  featuredBook: Book | null;
  activeProject: Project | null;
  latestUpdates: Update[];
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  featuredBook,
  activeProject,
  latestUpdates,
  navigate,
}) => {
  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      <SEOHead
        title="Início"
        description={`${settings.author_name} — Site oficial do autor e escritor. Conheça as obras literárias, projetos e o diário de criação.`}
      />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 sm:pt-20 md:pt-28 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Subtle decorative motif */}
        <div className="flex items-center justify-center gap-3 mb-6 text-amber-800/80 dark:text-amber-500/80">
          <span className="w-8 h-[1px] bg-amber-800/40 dark:bg-amber-500/40" />
          <Feather className="w-5 h-5 stroke-[1.5]" />
          <span className="w-8 h-[1px] bg-amber-800/40 dark:bg-amber-500/40" />
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-6">
          {settings.author_name}
        </h1>

        {settings.author_quote && (
          <p className="font-editorial text-xl sm:text-2xl md:text-3xl text-stone-600 dark:text-stone-300 italic font-normal max-w-2xl mx-auto leading-snug mb-10">
            "{settings.author_quote}"
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/livros')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Conheça meus livros</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate('/escrita')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-sm border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs uppercase tracking-widest font-semibold hover:bg-stone-100 dark:hover:bg-stone-900 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>Acompanhe minha escrita</span>
          </button>
        </div>
      </section>

      {/* ================= LIVRO EM DESTAQUE ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
              Seleção Editorial
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Livro em Destaque
            </h2>
          </div>
          <button
            onClick={() => navigate('/livros')}
            className="text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {featuredBook ? (
          <div className="bg-white dark:bg-stone-900/60 rounded-md border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
              {/* Cover Column */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative group w-48 sm:w-56 aspect-[2/3] rounded-sm overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-md">
                  {featuredBook.cover_url ? (
                    <img
                      src={featuredBook.cover_url}
                      alt={featuredBook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-100 dark:bg-stone-900 text-stone-500">
                      <BookOpen className="w-10 h-10 mb-2 stroke-[1.2] text-amber-800/60 dark:text-amber-500/60" />
                      <span className="font-serif text-sm font-medium">{featuredBook.title}</span>
                    </div>
                  )}
                  {featuredBook.is_demo && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider bg-stone-900/80 text-stone-200 backdrop-blur-xs rounded-xs">
                      Exemplo
                    </span>
                  )}
                </div>
              </div>

              {/* Details Column */}
              <div className="md:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span className="text-amber-800 dark:text-amber-400 font-medium">{featuredBook.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredBook.status}</span>
                  {featuredBook.page_count && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{featuredBook.page_count} páginas</span>
                    </>
                  )}
                  {featuredBook.edition && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{featuredBook.edition}</span>
                    </>
                  )}
                </div>

                <h3 className="font-serif text-2xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-50 leading-tight">
                  {featuredBook.title}
                </h3>

                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-editorial">
                  {featuredBook.short_description || featuredBook.description}
                </p>

                {/* Progress if developing */}
                {featuredBook.status !== 'Publicado' && (
                  <div className="pt-2 max-w-md">
                    <div className="flex justify-between text-xs text-stone-500 mb-1">
                      <span>Progresso da obra</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{featuredBook.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-800 dark:bg-amber-500 transition-all duration-700"
                        style={{ width: `${featuredBook.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Price and CTA */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  {featuredBook.price && (
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      R$ {Number(featuredBook.price).toFixed(2).replace('.', ',')}
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/livros/${featuredBook.slug}`)}
                    className="px-6 py-2.5 rounded-sm bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
                  >
                    Ver detalhes do livro
                  </button>

                  {featuredBook.store_url && (
                    <a
                      href={featuredBook.store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-sm border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs uppercase tracking-wider font-medium hover:border-amber-800 dark:hover:border-amber-400 transition-colors"
                    >
                      Comprar na loja
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-md bg-stone-50/50 dark:bg-stone-900/30">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-3 stroke-[1.2]" />
            <p className="font-serif text-lg text-stone-700 dark:text-stone-300 mb-1">
              Nenhum livro em destaque no momento
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Novas obras e edições serão destacadas aqui assim que forem anunciadas.
            </p>
          </div>
        )}
      </section>

      {/* ================= PROJETO ATUAL ================= */}
      {activeProject && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 pb-3 border-b border-stone-200 dark:border-stone-800">
            <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
              Em Desenvolvimento
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Projeto Atual
            </h2>
          </div>

          <div className="p-6 sm:p-8 bg-stone-100/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="text-amber-800 dark:text-amber-400 font-medium">{activeProject.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span>Status: {activeProject.status}</span>
                  {activeProject.is_demo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-400">[Exemplo]</span>
                    </>
                  )}
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
                  {activeProject.title}
                </h3>

                <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-editorial">
                  {activeProject.description}
                </p>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                    <span>Estágio de Conclusão</span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">{activeProject.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-800 dark:bg-amber-500 transition-all duration-700"
                      style={{ width: `${activeProject.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/projetos/${activeProject.slug}`)}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-400 hover:underline"
                  >
                    <span>Acompanhar etapas deste projeto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Project preview image or stats */}
              <div className="lg:col-span-4 bg-white dark:bg-stone-950 p-5 rounded-sm border border-stone-200/80 dark:border-stone-800 text-xs space-y-3">
                <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold uppercase tracking-wider text-[10px]">
                  <Compass className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  <span>Ficha Técnica do Projeto</span>
                </div>
                <div className="space-y-2 text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-900">
                  {activeProject.start_date && (
                    <div className="flex justify-between">
                      <span>Início da escrita:</span>
                      <span className="font-medium text-stone-900 dark:text-stone-200">{activeProject.start_date}</span>
                    </div>
                  )}
                  {activeProject.expected_release_date && (
                    <div className="flex justify-between">
                      <span>Previsão de término:</span>
                      <span className="font-medium text-stone-900 dark:text-stone-200">{activeProject.expected_release_date}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Acesso público:</span>
                    <span className="font-medium text-stone-900 dark:text-stone-200">
                      {activeProject.is_public ? 'Sim' : 'Restrito'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= ÚLTIMAS ATUALIZAÇÕES ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
              Diário de Criação
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Últimas Atualizações
            </h2>
          </div>
          <button
            onClick={() => navigate('/escrita')}
            className="text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Ver diário completo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {latestUpdates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestUpdates.slice(0, 3).map((up) => (
              <article
                key={up.id}
                onClick={() => navigate(`/escrita/${up.slug}`)}
                className="group cursor-pointer bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 rounded-sm p-6 hover:border-stone-400 dark:hover:border-stone-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="text-amber-800 dark:text-amber-400 font-medium">{up.category}</span>
                    <time>{new Date(up.created_at).toLocaleDateString('pt-BR')}</time>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    {up.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed font-editorial">
                    {up.excerpt || up.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
                  {/* Author avatar and name on update card */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 flex items-center justify-center">
                      {settings.author_photo_url ? (
                        <img
                          src={settings.author_photo_url}
                          alt={settings.author_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Feather className="w-3 h-3 text-stone-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                      {settings.author_name}
                    </span>
                  </div>

                  <span className="text-amber-800 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold text-[11px]">
                    Ler <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-md">
            <Feather className="w-7 h-7 text-stone-400 mx-auto mb-2 stroke-[1.2]" />
            <p className="font-serif text-base text-stone-700 dark:text-stone-300">
              Nenhuma anotação de escrita publicada recentemente
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Os registros de processo criativo aparecerão aqui à medida que forem redigidos.
            </p>
          </div>
        )}
      </section>

      {/* ================= SOBRE O AUTOR (BIOGRAFIA COMPLETA & DADOS DO AUTOR) ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Author Portrait */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-48 sm:w-56 aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-md">
                {settings.author_photo_url ? (
                  <img
                    src={settings.author_photo_url}
                    alt={settings.author_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-stone-400">
                    <Feather className="w-12 h-12 mb-3 stroke-[1.2] text-amber-800/60 dark:text-amber-500/60" />
                    <span className="font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                      {settings.author_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Author Biography & Details */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
                  Biografia do Autor
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
                  {settings.author_name}
                </h2>
                {settings.occupation && (
                  <p className="text-xs text-stone-500 font-medium">
                    {settings.occupation}
                  </p>
                )}
              </div>

              {/* Biographical facts */}
              {(settings.birth_date || settings.birth_place || settings.literary_influences) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-600 dark:text-stone-400 py-2 border-y border-stone-200/80 dark:border-stone-800">
                  {settings.birth_date && (
                    <div>
                      <span className="text-stone-400">Nascimento: </span>
                      <strong className="text-stone-800 dark:text-stone-200">
                        {new Date(settings.birth_date).toLocaleDateString('pt-BR')}
                      </strong>
                    </div>
                  )}
                  {settings.birth_place && (
                    <div>
                      <span className="text-stone-400">Origem: </span>
                      <strong className="text-stone-800 dark:text-stone-200">{settings.birth_place}</strong>
                    </div>
                  )}
                  {settings.literary_influences && (
                    <div className="w-full pt-1">
                      <span className="text-stone-400">Influências: </span>
                      <span className="text-stone-700 dark:text-stone-300 italic">{settings.literary_influences}</span>
                    </div>
                  )}
                </div>
              )}

              {settings.biography && (
                <p className="font-editorial text-base text-stone-700 dark:text-stone-300 leading-relaxed text-justify-pretty whitespace-pre-line">
                  {settings.biography}
                </p>
              )}

              {settings.career_summary && (
                <p className="text-xs text-stone-500 font-editorial italic pt-1">
                  "{settings.career_summary}"
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => navigate('/sobre')}
                  className="px-5 py-2.5 rounded-sm border border-stone-400 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs uppercase tracking-widest font-semibold hover:border-stone-900 dark:hover:border-stone-300 transition-colors cursor-pointer"
                >
                  Conheça a trajetória completa
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CHAMADA FINAL ================= */}
      <section className="text-center max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Mergulhe no universo das histórias
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-xl mx-auto mb-8 font-editorial">
          Acompanhe o nascimento de novos livros, leia ensaios e poemas inéditos e faça parte do processo criativo.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/livros')}
            className="px-7 py-3 rounded-sm bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Explorar Livros
          </button>
          <button
            onClick={() => navigate('/textos')}
            className="px-7 py-3 rounded-sm border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs uppercase tracking-widest font-semibold hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
          >
            Ler Textos &amp; Ensaios
          </button>
        </div>
      </section>
    </div>
  );
};
