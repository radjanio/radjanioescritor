import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { repository } from '../../lib/repository';
import {
  Book,
  Project,
  Update,
  TextItem,
  TimelineEvent,
  GalleryItem,
  SiteSettings
} from '../../types';
import { BooksManager } from './BooksManager';
import { ProjectsManager } from './ProjectsManager';
import { UpdatesManager } from './UpdatesManager';
import { TextsManager } from './TextsManager';
import { TimelineManager } from './TimelineManager';
import { GalleryManager } from './GalleryManager';
import { SettingsManager } from './SettingsManager';
import { SupabaseSetupTab } from './SupabaseSetupTab';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Feather,
  FileText,
  Calendar,
  Image as ImageIcon,
  Settings,
  Database,
  LogOut,
  Sparkles,
  Trash2,
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string) => void;
  subpage?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, subpage = 'dashboard' }) => {
  const { isAuthenticated, logout, userEmail, isSupabaseLive, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(subpage);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [books, setBooks] = useState<Book[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    if (subpage && subpage !== activeTab) {
      setActiveTab(subpage);
    }
  }, [subpage]);

  const refreshAllData = async () => {
    const [b, p, u, t, tl, g, s] = await Promise.all([
      repository.getBooks(),
      repository.getProjects(true),
      repository.getUpdates(true),
      repository.getTexts(true),
      repository.getTimeline(true),
      repository.getGallery(true),
      repository.getSettings(),
    ]);

    setBooks(b);
    setProjects(p);
    setUpdates(u);
    setTexts(t);
    setTimelineEvents(tl);
    setGallery(g);
    setSettings(s);
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    navigate(`/admin/${tab}`);
  };

  const handleLoadDemoData = () => {
    if (window.confirm('Deseja carregar dados de demonstração claramente identificados para testar o site?')) {
      repository.loadIdentifiedSampleData();
      refreshAllData();
    }
  };

  const handleClearDemoData = () => {
    if (window.confirm('Deseja remover todos os registros marcados como demonstração/exemplo?')) {
      repository.clearDemoData();
      refreshAllData();
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs font-mono text-stone-500">Verificando autorização do autor...</p>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'livros', label: 'Livros', icon: BookOpen, count: books.length },
    { id: 'projetos', label: 'Projetos', icon: Compass, count: projects.length },
    { id: 'atualizacoes', label: 'Atualizações', icon: Feather, count: updates.length },
    { id: 'textos', label: 'Textos', icon: FileText, count: texts.length },
    { id: 'timeline', label: 'Linha do Tempo', icon: Calendar, count: timelineEvents.length },
    { id: 'galeria', label: 'Galeria', icon: ImageIcon, count: gallery.length },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, count: null },
    { id: 'supabase', label: 'Supabase & SQL', icon: Database, count: null },
  ];

  // Latest published content item
  const latestContent = [
    ...updates.map((u) => ({ type: 'Atualização', title: u.title, date: u.created_at })),
    ...books.map((b) => ({ type: 'Livro', title: b.title, date: b.created_at })),
    ...texts.map((t) => ({ type: 'Texto', title: t.title, date: t.created_at })),
    ...projects.map((p) => ({ type: 'Projeto', title: p.title, date: p.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const hasDemoItems = [
    ...books,
    ...projects,
    ...updates,
    ...texts,
    ...timelineEvents,
    ...gallery,
  ].some((i) => i.is_demo);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-amber-800 dark:text-amber-400" />
          <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
            Painel do Autor
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-stone-600 dark:text-stone-300"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 shrink-0 bg-white dark:bg-stone-900/90 border-r border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 font-bold block">
              Painel Administrativo
            </span>
            <h1 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
              {settings?.author_name || 'Radjanio Silva Souza'}
            </h1>
            <p className="text-[11px] text-stone-400 truncate">{userEmail}</p>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-xs ${
                        isActive
                          ? 'bg-stone-800 text-stone-200 dark:bg-stone-200 dark:text-stone-800'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer of Sidebar */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver site público</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
        {/* DASHBOARD OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Visão Geral Editorial
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Resumo de publicações, livros, projetos e status do banco de dados de Radjanio Silva Souza.
                </p>
              </div>

              {/* Demo Data Management (Rule 27 compliance) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadDemoData}
                  className="px-3 py-1.5 rounded-sm border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer"
                  title="Carrega dados claramente marcados como [Exemplo]"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Carregar Exemplos</span>
                </button>
                {hasDemoItems && (
                  <button
                    onClick={handleClearDemoData}
                    className="px-3 py-1.5 rounded-sm border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 cursor-pointer"
                    title="Exclui todos os dados marcados como exemplo"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar Exemplos</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div
                onClick={() => handleSelectTab('livros')}
                className="bg-white dark:bg-stone-900/60 p-5 rounded-sm border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Livros</span>
                  <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                </div>
                <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {books.length}
                </div>
                <span className="text-[10px] text-stone-400">Títulos no acervo</span>
              </div>

              <div
                onClick={() => handleSelectTab('projetos')}
                className="bg-white dark:bg-stone-900/60 p-5 rounded-sm border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Projetos</span>
                  <Compass className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                </div>
                <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {projects.length}
                </div>
                <span className="text-[10px] text-stone-400">Em andamento</span>
              </div>

              <div
                onClick={() => handleSelectTab('atualizacoes')}
                className="bg-white dark:bg-stone-900/60 p-5 rounded-sm border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Diário</span>
                  <Feather className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                </div>
                <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {updates.length}
                </div>
                <span className="text-[10px] text-stone-400">Anotações do ofício</span>
              </div>

              <div
                onClick={() => handleSelectTab('textos')}
                className="bg-white dark:bg-stone-900/60 p-5 rounded-sm border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Textos</span>
                  <FileText className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                </div>
                <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {texts.length}
                </div>
                <span className="text-[10px] text-stone-400">Crônicas &amp; Poemas</span>
              </div>

              <div
                onClick={() => handleSelectTab('galeria')}
                className="bg-white dark:bg-stone-900/60 p-5 rounded-sm border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-amber-700 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Galeria</span>
                  <ImageIcon className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                </div>
                <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {gallery.length}
                </div>
                <span className="text-[10px] text-stone-400">Artes e Fotos</span>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Content */}
              <div className="bg-white dark:bg-stone-900/60 p-6 rounded-sm border border-stone-200 dark:border-stone-800 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                  Último Conteúdo Registrado
                </span>
                {latestContent ? (
                  <div>
                    <span className="text-xs text-amber-800 dark:text-amber-400 font-medium block">
                      {latestContent.type}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                      {latestContent.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Registrado em: {new Date(latestContent.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">Nenhum conteúdo registrado ainda.</p>
                )}
              </div>

              {/* Database status banner */}
              <div className="bg-white dark:bg-stone-900/60 p-6 rounded-sm border border-stone-200 dark:border-stone-800 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                  Banco de Dados &amp; Armazenamento
                </span>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {isSupabaseLive ? 'Supabase Conectado' : 'Modo Standby (Local Persistente)'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {isSupabaseLive
                    ? 'Seu projeto oficial do Supabase está sincronizado com Auth, Storage e PostgreSQL com RLS.'
                    : 'Configure sua Project URL e chave Anon na aba Supabase para habilitar a nuvem.'}
                </p>
                <button
                  onClick={() => handleSelectTab('supabase')}
                  className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Gerenciar conexão Supabase</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBMODULES */}
        {activeTab === 'livros' && <BooksManager books={books} onRefresh={refreshAllData} />}
        {activeTab === 'projetos' && <ProjectsManager projects={projects} onRefresh={refreshAllData} />}
        {activeTab === 'atualizacoes' && (
          <UpdatesManager updates={updates} books={books} projects={projects} onRefresh={refreshAllData} />
        )}
        {activeTab === 'textos' && <TextsManager texts={texts} onRefresh={refreshAllData} />}
        {activeTab === 'timeline' && <TimelineManager events={timelineEvents} onRefresh={refreshAllData} />}
        {activeTab === 'galeria' && (
          <GalleryManager gallery={gallery} books={books} projects={projects} onRefresh={refreshAllData} />
        )}
        {activeTab === 'configuracoes' && settings && (
          <SettingsManager settings={settings} onRefresh={refreshAllData} />
        )}
        {activeTab === 'supabase' && <SupabaseSetupTab />}
      </main>
    </div>
  );
};
