import React from 'react';
import { Project, Update } from '../types';
import { SEOHead } from '../components/SEOHead';
import { ArrowLeft, Calendar, Compass, Layers, CheckCircle, Clock, Circle, ArrowRight } from 'lucide-react';

interface ProjectDetailPageProps {
  project: Project | null;
  updates: Update[];
  navigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, updates, navigate }) => {
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
          Projeto não encontrado
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          O projeto literário solicitado não existe ou está marcado como restrito.
        </p>
        <button
          onClick={() => navigate('/projetos')}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-wider rounded-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos projetos
        </button>
      </div>
    );
  }

  const stages = project.stages && project.stages.length > 0 ? project.stages : [
    { id: '1', title: 'Concepção & Argumento', status: project.progress >= 25 ? 'Concluído' : 'Em andamento', order_index: 0 },
    { id: '2', title: 'Pesquisa e Ambientação', status: project.progress >= 50 ? 'Concluído' : (project.progress >= 25 ? 'Em andamento' : 'Pendente'), order_index: 1 },
    { id: '3', title: 'Escrita do Primeiro Rascunho', status: project.progress >= 75 ? 'Concluído' : (project.progress >= 50 ? 'Em andamento' : 'Pendente'), order_index: 2 },
    { id: '4', title: 'Revisão & Ajustes Estruturais', status: project.progress >= 95 ? 'Concluído' : (project.progress >= 75 ? 'Em andamento' : 'Pendente'), order_index: 3 },
    { id: '5', title: 'Finalização do Manuscrito', status: project.progress >= 100 ? 'Concluído' : (project.progress >= 95 ? 'Em andamento' : 'Pendente'), order_index: 4 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      <SEOHead
        title={project.title}
        description={project.description.substring(0, 160)}
      />

      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/projetos')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos projetos</span>
        </button>
      </div>

      {/* Project Presentation */}
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="text-amber-800 dark:text-amber-400 font-semibold">{project.genre}</span>
          <span aria-hidden="true">·</span>
          <span>Status: {project.status}</span>
          {project.is_demo && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">[Exemplo]</span>
            </>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
          {project.title}
        </h1>

        {/* Details bar */}
        <div className="flex flex-wrap items-center gap-6 py-3 border-y border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
          {project.start_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <span>Início: <strong className="text-stone-900 dark:text-stone-200">{project.start_date}</strong></span>
            </div>
          )}
          {project.expected_release_date && (
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <span>Previsão: <strong className="text-stone-900 dark:text-stone-200">{project.expected_release_date}</strong></span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pt-2 font-editorial text-lg sm:text-xl text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line text-justify-pretty">
          {project.description}
        </div>
      </div>

      {/* Image if available */}
      {project.image_url && (
        <div className="max-w-4xl rounded-sm overflow-hidden aspect-[16/9] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Progress & Stages */}
      <section className="p-8 sm:p-10 bg-stone-100/60 dark:bg-stone-900/40 rounded-sm border border-stone-200/80 dark:border-stone-800 space-y-8">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
            Evolução do Projeto
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Etapas &amp; Andamento
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-stone-700 dark:text-stone-300">
              Progresso Geral
            </span>
            <span className="font-serif text-base font-bold text-amber-900 dark:text-amber-400">
              {project.progress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-800 dark:bg-amber-500 transition-all duration-700"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Stages list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
          {stages.map((stg: any, idx) => {
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
              </div>
            );
          })}
        </div>
      </section>

      {/* Updates related to project */}
      <section className="space-y-6">
        <div className="pb-3 border-b border-stone-200 dark:border-stone-800">
          <span className="text-[11px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-semibold block">
            Registros do Projeto
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Atualizações Deste Projeto
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
              Nenhuma anotação associada diretamente a este projeto no momento.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
