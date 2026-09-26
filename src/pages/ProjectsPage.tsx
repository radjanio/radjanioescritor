import React from 'react';
import { Project } from '../types';
import { SEOHead } from '../components/SEOHead';
import { EmptyState } from '../components/EmptyState';
import { Compass, Calendar, ArrowRight, Layers } from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  navigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      <SEOHead
        title="Projetos Literários"
        description="Acompanhe os projetos literários em andamento de Radjanio Silva Souza, manuscritos, pesquisas e previsões de lançamento."
      />

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
          Em Andamento &amp; Futuros Lançamentos
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Projetos Literários
        </h1>
        <p className="font-editorial text-base sm:text-lg text-stone-600 dark:text-stone-300">
          Pesquisas, ideias em gestação e romances em desenvolvimento ativo pelo autor.
        </p>
      </div>

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 rounded-sm p-6 sm:p-8 flex flex-col justify-between hover:border-stone-400 dark:hover:border-stone-700 transition-all shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="text-amber-800 dark:text-amber-400 font-semibold">{proj.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span>{proj.status}</span>
                  {proj.is_demo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-400">[Exemplo]</span>
                    </>
                  )}
                </div>

                <h2
                  onClick={() => navigate(`/projetos/${proj.slug}`)}
                  className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-900 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                >
                  {proj.title}
                </h2>

                <p className="font-editorial text-stone-600 dark:text-stone-400 text-sm leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-stone-500 mb-1">
                    <span>Progresso atual</span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-800 dark:bg-amber-500 transition-all duration-700"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                {(proj.start_date || proj.expected_release_date) && (
                  <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-500">
                    {proj.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        Início: {proj.start_date}
                      </span>
                    )}
                    {proj.expected_release_date && (
                      <span className="flex items-center gap-1">
                        <Compass className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                        Previsão: {proj.expected_release_date}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/projetos/${proj.slug}`)}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>Ver ficha do projeto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum projeto público no momento"
          description="Radjanio Silva Souza ainda não tornou públicos novos projetos em desenvolvimento. Em breve novos esboços e livros serão revelados aqui."
          icon="folder"
        />
      )}
    </div>
  );
};
