import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useRouter } from './lib/router';
import { repository } from './lib/repository';
import {
  Book,
  Project,
  Update,
  TextItem,
  TimelineEvent,
  GalleryItem,
  SiteSettings,
  AcademicItem
} from './types';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { WritingJournalPage } from './pages/WritingJournalPage';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TextsPage } from './pages/TextsPage';
import { TextDetailPage } from './pages/TextDetailPage';
import { TimelinePage } from './pages/TimelinePage';
import { GalleryPage } from './pages/GalleryPage';
import { AcademicPage } from './pages/AcademicPage';
import { AboutPage } from './pages/AboutPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export function AppContent() {
  const { pathname, route, navigate } = useRouter();

  const [settings, setSettings] = useState<SiteSettings>({
    id: 'a0000000-0000-0000-0000-000000000001',
    author_name: 'Radjanio Silva Souza',
    biography: 'Radjanio Silva Souza é autor e escritor contemporâneo, dedicado à ficção, narrativas imersivas e à investigação das complexidades humanas através da palavra escrita.',
    author_photo_url: '',
    author_quote: 'A escrita é a ponte silenciosa entre o abismo interior e a luz compartilhada.',
    email: 'radjaniokk@gmail.com',
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [academicItems, setAcademicItems] = useState<AcademicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [s, b, p, u, t, tl, g, ac] = await Promise.all([
        repository.getSettings(),
        repository.getBooks(),
        repository.getProjects(false), // only public
        repository.getUpdates(false), // only published
        repository.getTexts(false), // only published
        repository.getTimeline(false),
        repository.getGallery(false),
        repository.getAcademicItems(false),
      ]);

      setSettings(s);
      setBooks(b);
      setProjects(p);
      setUpdates(u);
      setTexts(t);
      setTimelineEvents(tl);
      setGallery(g);
      setAcademicItems(ac);
    } catch (err) {
      console.error('Falha ao carregar acervo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pathname]);

  // Featured book on home: either marked featured, or the first published book, or first book
  const featuredBook =
    books.find((b) => b.featured) ||
    books.find((b) => b.status === 'Publicado') ||
    books[0] ||
    null;

  // Active project on home
  const activeProject =
    projects.find((p) => p.status === 'Em escrita ativa' || p.status === 'Em andamento') ||
    projects[0] ||
    null;

  // Render appropriate view
  const renderView = () => {
    // 1. HOME
    if (route.path === 'home') {
      return (
        <HomePage
          settings={settings}
          featuredBook={featuredBook}
          activeProject={activeProject}
          latestUpdates={updates}
          navigate={navigate}
        />
      );
    }

    // 2. LIVROS & LIVRO DETALHE
    if (route.path === 'livros') {
      if (route.slug) {
        const book = books.find((b) => b.slug === route.slug) || null;
        const bookUpdates = updates.filter((u) => u.book_id === book?.id);
        return <BookDetailPage book={book} updates={bookUpdates} navigate={navigate} />;
      }
      return <BooksPage books={books} navigate={navigate} />;
    }

    // 3. DIÁRIO DE ESCRITA & ANOTAÇÃO DETALHE
    if (route.path === 'escrita') {
      if (route.slug) {
        const entry = updates.find((u) => u.slug === route.slug) || null;
        return <JournalDetailPage update={entry} navigate={navigate} />;
      }
      return <WritingJournalPage updates={updates} navigate={navigate} />;
    }

    // 4. PROJETOS & PROJETO DETALHE
    if (route.path === 'projetos') {
      if (route.slug) {
        const proj = projects.find((p) => p.slug === route.slug) || null;
        const projUpdates = updates.filter((u) => u.project_id === proj?.id);
        return <ProjectDetailPage project={proj} updates={projUpdates} navigate={navigate} />;
      }
      return <ProjectsPage projects={projects} navigate={navigate} />;
    }

    // 5. TEXTOS AUTORAIS & LEITOR DETALHE
    if (route.path === 'textos') {
      if (route.slug) {
        const textItem = texts.find((t) => t.slug === route.slug) || null;
        return <TextDetailPage textItem={textItem} navigate={navigate} />;
      }
      return <TextsPage texts={texts} navigate={navigate} />;
    }

    // 6. LINHA DO TEMPO
    if (route.path === 'timeline') {
      return <TimelinePage events={timelineEvents} navigate={navigate} />;
    }

    // 7. GALERIA
    if (route.path === 'galeria') {
      return <GalleryPage items={gallery} navigate={navigate} />;
    }

    // 8. ACADÊMICO (FORMAÇÃO, CURSOS & PESQUISA)
    if (route.path === 'academico') {
      return <AcademicPage items={academicItems} settings={settings} navigate={navigate} />;
    }

    // 9. SOBRE
    if (route.path === 'sobre') {
      return <AboutPage settings={settings} navigate={navigate} />;
    }

    // 9. ADMIN LOGIN
    if (route.path === 'admin-login') {
      return <AdminLoginPage navigate={navigate} />;
    }

    // 10. ADMIN DASHBOARD
    if (route.path === 'admin') {
      return <AdminDashboard navigate={navigate} subpage={route.subpage} />;
    }

    // Fallback Home
    return (
      <HomePage
        settings={settings}
        featuredBook={featuredBook}
        activeProject={activeProject}
        latestUpdates={updates}
        navigate={navigate}
      />
    );
  };

  const isAdminArea = route.path === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {!isAdminArea && (
        <Navbar
          currentPath={pathname}
          navigate={navigate}
          authorName={settings.author_name}
        />
      )}

      <main className="flex-1">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-amber-800 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-xs text-stone-500 tracking-wider uppercase">
              Carregando acervo literário...
            </p>
          </div>
        ) : (
          renderView()
        )}
      </main>

      {!isAdminArea && <Footer settings={settings} navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
