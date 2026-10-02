import React, { useState, useMemo } from 'react';
import { AcademicItem, AcademicType, SiteSettings } from '../types';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  Award,
  ExternalLink,
  Search,
  Sparkles,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Copy,
  Check,
  X,
  FileCheck
} from 'lucide-react';

interface AcademicPageProps {
  items: AcademicItem[];
  settings: SiteSettings;
  navigate: (path: string) => void;
}

export const AcademicPage: React.FC<AcademicPageProps> = ({ items, settings, navigate }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<AcademicItem | null>(null);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const academicTypes: { label: string; value: AcademicType | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Formações', value: 'Formação' },
    { label: 'Cursos & Oficinas', value: 'Curso & Oficina' },
    { label: 'Artigos & Pesquisa', value: 'Artigo & Pesquisa' },
    { label: 'Palestras & Docência', value: 'Palestra & Docência' },
    { label: 'Certificações', value: 'Certificação' },
  ];

  // Filtered
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchType = selectedType === 'all' || it.type === selectedType;
      const matchSearch =
        !searchTerm ||
        it.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (it.field_of_study && it.field_of_study.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (it.description && it.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [items, selectedType, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const degrees = items.filter((i) => i.type === 'Formação').length;
    const courses = items.filter((i) => i.type === 'Curso & Oficina').length;
    const papers = items.filter((i) => i.type === 'Artigo & Pesquisa').length;
    const totalHours = items.reduce((acc, curr) => acc + (curr.workload_hours || 0), 0);
    return { degrees, courses, papers, totalHours };
  }, [items]);

  const featuredItems = useMemo(() => {
    return items.filter((i) => i.featured);
  }, [items]);

  const copyAbntCitation = (item: AcademicItem) => {
    const authorUpper = (settings.author_name || 'SOUZA, Radjanio Silva').toUpperCase();
    const year = item.end_year || item.start_year || new Date().getFullYear();
    const citation = `${authorUpper}. ${item.title}. ${item.institution}, ${year}.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const getTypeIcon = (type: AcademicType) => {
    switch (type) {
      case 'Formação':
        return <GraduationCap className="w-4 h-4 text-amber-800 dark:text-amber-400" />;
      case 'Curso & Oficina':
        return <BookOpen className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />;
      case 'Artigo & Pesquisa':
        return <FileText className="w-4 h-4 text-sky-800 dark:text-sky-400" />;
      case 'Palestra & Docência':
        return <Users className="w-4 h-4 text-purple-800 dark:text-purple-400" />;
      case 'Certificação':
        return <Award className="w-4 h-4 text-rose-800 dark:text-rose-400" />;
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <section className="space-y-6 max-w-4xl">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-800 dark:text-amber-400 block font-sans">
              Currículo &amp; Formação Autoral
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
              Trajetória Acadêmica &amp; Estudos
            </h1>
            <p className="font-editorial text-lg sm:text-xl text-stone-600 dark:text-stone-300 leading-relaxed">
              O embasamento teórico, as pesquisas literárias, cursos de especialização e o aprofundamento constante na arte da palavra e da narrativa ficcional.
            </p>
          </div>

          {/* Unboxed Metadata Stats with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
            <span className="font-medium text-stone-800 dark:text-stone-200">
              <strong className="font-bold text-stone-900 dark:text-stone-100">{stats.degrees}</strong> Formações
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-800 dark:text-stone-200">
              <strong className="font-bold text-stone-900 dark:text-stone-100">{stats.courses}</strong> Cursos &amp; Oficinas
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-800 dark:text-stone-200">
              <strong className="font-bold text-stone-900 dark:text-stone-100">{stats.papers}</strong> Artigos &amp; Ensaios
            </span>
            {stats.totalHours > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  <strong className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{stats.totalHours}h</strong> de Estudo
                </span>
              </>
            )}
          </div>

          {/* Academic Profiles & Portals (Lattes, ORCID) */}
          {(settings.lattes_url || settings.orcid_url) && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {settings.lattes_url && (
                <a
                  href={settings.lattes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium rounded-sm transition-colors border border-stone-200 dark:border-stone-800"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                  <span>Currículo Lattes (CNPq)</span>
                </a>
              )}
              {settings.orcid_url && (
                <a
                  href={settings.orcid_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium rounded-sm transition-colors border border-stone-200 dark:border-stone-800"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                  <span>Identificador ORCID iD</span>
                </a>
              )}
            </div>
          )}
        </section>

        {/* FEATURED RESEARCH / DEGREES SPOTLIGHT */}
        {featuredItems.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                <span>Destaques Acadêmicos &amp; Linhas de Pesquisa</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveModalItem(item)}
                  className="group p-6 bg-white dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 hover:border-amber-700/50 dark:hover:border-amber-500/50 rounded-sm transition-all cursor-pointer space-y-3 relative"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                      {getTypeIcon(item.type)}
                      <span>{item.type}</span>
                    </span>
                    <span className="tabular-nums">
                      {item.start_year === item.end_year || !item.start_year
                        ? item.end_year || item.start_year
                        : `${item.start_year} – ${item.end_year}`}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                    {item.institution} {item.degree_level ? `· ${item.degree_level}` : ''}
                  </p>

                  {item.field_of_study && (
                    <p className="text-xs text-amber-900/90 dark:text-amber-400/90 italic">
                      Foco: {item.field_of_study}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] font-medium text-amber-800 dark:text-amber-400">
                    <span>Ver detalhes completos</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTROLS (TABS & SEARCH) */}
        <section className="space-y-4">
          <div className="bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Interactive Segmented Filter Controls */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
              {academicTypes.map((tab) => {
                const count =
                  tab.value === 'all' ? items.length : items.filter((i) => i.type === tab.value).length;
                const active = selectedType === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedType(tab.value)}
                    className={`px-3 py-1.5 rounded-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por curso, tema, faculdade..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* LIST OF ACADEMIC ITEMS */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm space-y-3">
                <GraduationCap className="w-8 h-8 text-stone-400 mx-auto stroke-[1.5]" />
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Nenhum registro encontrado
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Nenhum item corresponde aos filtros selecionados. Tente alterar o termo de busca ou navegar por outra categoria.
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => setActiveModalItem(item)}
                    className="group p-6 bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-sm transition-all cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Quiet metadata header */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <span className="inline-flex items-center gap-1 font-medium text-stone-800 dark:text-stone-200">
                          {getTypeIcon(item.type)}
                          <span>{item.type}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {item.institution}
                        </span>
                        {item.degree_level && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.degree_level}</span>
                          </>
                        )}
                        {(item.start_year || item.end_year) && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {item.start_year === item.end_year || !item.start_year
                                ? item.end_year || item.start_year
                                : `${item.start_year} – ${item.end_year}`}
                            </span>
                          </>
                        )}
                        {item.workload_hours && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{item.workload_hours}h</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className={item.status === 'Concluído' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                          {item.status}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>

                      {/* Field of study */}
                      {item.field_of_study && (
                        <p className="text-xs text-amber-900 dark:text-amber-400 font-medium">
                          Área de Concentração: {item.field_of_study}
                        </p>
                      )}

                      {/* Thesis or monograph */}
                      {item.thesis_title && (
                        <p className="font-editorial text-xs italic text-stone-700 dark:text-stone-300">
                          Pesquisa / Tese: "{item.thesis_title}"
                          {item.advisor && (
                            <span className="not-italic text-stone-400 font-sans"> · Orientação: {item.advisor}</span>
                          )}
                        </p>
                      )}

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {/* Direct Action links */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                        {item.certificate_url && (
                          <span className="text-stone-700 dark:text-stone-300 group-hover:text-amber-800 dark:group-hover:text-amber-400 font-medium inline-flex items-center gap-1.5 underline">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Comprovante / Certificado disponível</span>
                          </span>
                        )}
                        {item.external_link && (
                          <span className="text-stone-700 dark:text-stone-300 group-hover:text-amber-800 dark:group-hover:text-amber-400 font-medium inline-flex items-center gap-1.5 underline">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Link para publicação</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="self-start md:self-center shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 group-hover:text-amber-800 dark:group-hover:text-amber-400">
                        <span>Detalhes</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* DETAIL MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Top close */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                    {getTypeIcon(activeModalItem.type)}
                    <span>{activeModalItem.type}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={activeModalItem.status === 'Concluído' ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-amber-700 dark:text-amber-400 font-medium'}>
                    {activeModalItem.status}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {activeModalItem.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                aria-label="Fechar"
                className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Institution & Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-sm border border-stone-200/70 dark:border-stone-800 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">
                  Instituição
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                  {activeModalItem.institution}
                </span>
                {activeModalItem.degree_level && (
                  <span className="text-stone-500 block">{activeModalItem.degree_level}</span>
                )}
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-sm border border-stone-200/70 dark:border-stone-800 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">
                  Período &amp; Carga Horária
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 block tabular-nums">
                  {activeModalItem.start_year === activeModalItem.end_year || !activeModalItem.start_year
                    ? activeModalItem.end_year || activeModalItem.start_year || 'Ano não informado'
                    : `${activeModalItem.start_year} – ${activeModalItem.end_year}`}
                </span>
                {activeModalItem.workload_hours && (
                  <span className="text-stone-500 block tabular-nums">
                    Carga Horária: {activeModalItem.workload_hours} horas
                  </span>
                )}
              </div>
            </div>

            {/* Thesis / Topic */}
            {activeModalItem.thesis_title && (
              <div className="space-y-1 p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-sm text-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-400 block">
                  Título da Monografia / Dissertação / Ensaio
                </span>
                <p className="font-editorial text-sm font-semibold text-stone-900 dark:text-stone-100">
                  "{activeModalItem.thesis_title}"
                </p>
                {activeModalItem.advisor && (
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">
                    Orientador(a): {activeModalItem.advisor}
                  </p>
                )}
              </div>
            )}

            {/* Full description / ementa */}
            {activeModalItem.description && (
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">
                  Ementa &amp; Síntese dos Estudos
                </span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-editorial text-sm whitespace-pre-line">
                  {activeModalItem.description}
                </p>
              </div>
            )}

            {/* Academic ABNT Citation block for papers/theses */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                  Referência Bibliográfica / Citação ABNT
                </span>
                <button
                  onClick={() => copyAbntCitation(activeModalItem)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {copiedCitation ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCitation ? 'Copiado!' : 'Copiar citação'}</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed bg-white dark:bg-stone-900 p-2.5 rounded-xs border border-stone-200/60 dark:border-stone-800">
                {(settings.author_name || 'SOUZA, Radjanio Silva').toUpperCase()}.{' '}
                {activeModalItem.title}. {activeModalItem.institution},{' '}
                {activeModalItem.end_year || activeModalItem.start_year || new Date().getFullYear()}.
              </p>
            </div>

            {/* Attachment buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
              {activeModalItem.certificate_url && (
                <a
                  href={activeModalItem.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-800 dark:hover:bg-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar / Visualizar Certificado</span>
                </a>
              )}
              {activeModalItem.external_link && (
                <a
                  href={activeModalItem.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Acessar Publicação</span>
                </a>
              )}
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
