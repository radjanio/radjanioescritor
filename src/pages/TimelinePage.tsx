import React from 'react';
import { TimelineEvent } from '../types';
import { SEOHead } from '../components/SEOHead';
import { EmptyState } from '../components/EmptyState';
import { Calendar, Clock, Feather } from 'lucide-react';

interface TimelinePageProps {
  events: TimelineEvent[];
  navigate: (path: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ events, navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      <SEOHead
        title="Linha do Tempo"
        description="Trajetória literária, marcos temporais e marcos de publicação de Radjanio Silva Souza."
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold block">
          História &amp; Memória
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Linha do Tempo
        </h1>
        <p className="font-editorial text-base sm:text-lg text-stone-600 dark:text-stone-300">
          A trajetória criativa, primeiras publicações e marcos cronológicos de Radjanio Silva Souza.
        </p>
      </div>

      {/* Timeline Stream */}
      {events.length > 0 ? (
        <div className="relative border-l border-stone-300 dark:border-stone-800 ml-4 sm:ml-32 md:ml-40 space-y-12 pb-8">
          {events.map((ev, index) => {
            const formattedDate = new Date(ev.event_date).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'short',
            });

            return (
              <div key={ev.id} className="relative pl-6 sm:pl-8 group">
                {/* Node marker */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-stone-50 dark:bg-stone-950 border-2 border-amber-800 dark:border-amber-400 group-hover:scale-125 transition-transform" />

                {/* Left date tag for larger screens */}
                <div className="hidden sm:block absolute -left-36 top-1 w-28 text-right text-xs uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-400">
                  {formattedDate}
                </div>

                {/* Event Card */}
                <div className="bg-white dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 rounded-sm p-6 sm:p-7 space-y-3 hover:border-stone-400 dark:hover:border-stone-700 transition-all shadow-xs">
                  {/* Mobile Date */}
                  <div className="sm:hidden text-xs uppercase tracking-wider font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
                    {ev.title}
                  </h3>

                  <p className="font-editorial text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line text-justify-pretty">
                    {ev.description}
                  </p>

                  {ev.image_url && (
                    <div className="pt-2 rounded-sm overflow-hidden aspect-[16/9] bg-stone-100 dark:bg-stone-950 max-w-lg">
                      <img
                        src={ev.image_url}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {ev.is_demo && (
                    <div className="pt-2 text-[10px] text-stone-400 uppercase tracking-widest">
                      [Exemplo demonstrativo]
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nenhum marco registrado na linha do tempo"
          description="A linha cronológica ainda não contém eventos publicados pelo autor. Momentos significativos da carreira literária serão registrados aqui."
          icon="calendar"
        />
      )}
    </div>
  );
};
