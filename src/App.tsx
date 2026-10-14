import React, { useState, useEffect } from 'react';
import { hymns, getHymnById } from './data/hymnsData';
import { Hymn, ThemeMode } from './types/hymn';
import { Navbar } from './components/Navbar';
import { HymnIndex } from './components/HymnIndex';
import { HymnView } from './components/HymnView';
import { SabbathSchoolView } from './components/SabbathSchoolView';
import { WorshipOrderModal } from './components/WorshipOrderModal';
import { PresentationModal } from './components/PresentationModal';
import { Menu, BookOpen, Music, Heart, ChevronLeft, Search, Calendar, Church, X } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('maga_maga_sda_theme');
    return (saved as ThemeMode) || 'sepia';
  });

  // Main active tab: 'hymnal' or 'sabbath-school'
  const [activeTab, setActiveTab] = useState<'hymnal' | 'sabbath-school'>('hymnal');

  // Selected Hymn state
  const [selectedHymnId, setSelectedHymnId] = useState<number>(() => {
    const saved = localStorage.getItem('maga_maga_sda_last_hymn');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Favorites state
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('maga_maga_sda_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [1, 19, 362, 366, 371, 395, 414, 502, 546]; // default favorites
  });

  // Filters and views
  const [languageFilter, setLanguageFilter] = useState<'All' | 'Juba Arabic' | 'English' | 'Favorites'>('All');
  const [isWorshipModalOpen, setIsWorshipModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);
  const [isSidebarCollapsedOnDesktop, setIsSidebarCollapsedOnDesktop] = useState(false);

  // Sync theme to localStorage and document class
  useEffect(() => {
    localStorage.setItem('maga_maga_sda_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Sync selected hymn to localStorage
  useEffect(() => {
    localStorage.setItem('maga_maga_sda_last_hymn', selectedHymnId.toString());
  }, [selectedHymnId]);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('maga_maga_sda_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const currentHymn = getHymnById(selectedHymnId) || hymns[1];

  const currentHymnIndex = hymns.findIndex(h => h.id === selectedHymnId);
  const hasPrevious = currentHymnIndex > 0;
  const hasNext = currentHymnIndex < hymns.length - 1;

  const handlePreviousHymn = () => {
    if (hasPrevious) {
      setActiveTab('hymnal');
      setSelectedHymnId(hymns[currentHymnIndex - 1].id);
    }
  };

  const handleNextHymn = () => {
    if (hasNext) {
      setActiveTab('hymnal');
      setSelectedHymnId(hymns[currentHymnIndex + 1].id);
    }
  };

  // Global keyboard shortcuts: Left/Right arrow keys to navigate between hymns and 'f' to toggle favorite status
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input, textarea, select, or contenteditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (e.g. Cmd+F, Ctrl+F, Alt+Arrow)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Do not intercept if presentation modal or worship order modal is active
      if (isPresentationOpen || isWorshipModalOpen) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (hasPrevious) {
          e.preventDefault();
          handlePreviousHymn();
        }
      } else if (e.key === 'ArrowRight') {
        if (hasNext) {
          e.preventDefault();
          handleNextHymn();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFavorite(currentHymn.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext, currentHymnIndex, currentHymn.id, isPresentationOpen, isWorshipModalOpen]);

  const handleSelectHymn = (hymn: Hymn) => {
    setActiveTab('hymnal');
    setSelectedHymnId(hymn.id);
    setIsSidebarOpenOnMobile(false);
  };

  const handleSelectHymnId = (id: number) => {
    const found = getHymnById(id);
    if (found) {
      setActiveTab('hymnal');
      setSelectedHymnId(id);
      setIsSidebarOpenOnMobile(false);
    }
  };

  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  const appBg = isDark
    ? 'bg-slate-950 text-slate-100'
    : isSepia
    ? 'bg-[#fcf7ee] text-[#3b2d1c]'
    : 'bg-[#fafafa] text-slate-900';

  const sidebarBg = isDark
    ? 'bg-slate-900/95 border-slate-800'
    : isSepia
    ? 'bg-[#f7f0e3] border-[#decbb0]'
    : 'bg-white border-slate-200';

  return (
    <div className={`h-[100dvh] max-h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors ${appBg}`}>
      {/* Top Navigation Bar */}
      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        languageFilter={languageFilter}
        onLanguageFilterChange={setLanguageFilter}
        onSelectHymnId={handleSelectHymnId}
        onOpenWorshipModal={() => setIsWorshipModalOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        favoritesCount={favorites.length}
        totalHymnsCount={hymns.length - 1} // excluding 0
        currentHymnId={selectedHymnId}
      />

      {/* Main Layout Area */}
      {activeTab === 'hymnal' ? (
        <main className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sidebar Backdrop */}
          {isSidebarOpenOnMobile && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarOpenOnMobile(false)}
            />
          )}

          {/* Left Side: Searchable Index Sidebar / Mobile Slide-Over Sheet */}
          <aside
            className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto w-full sm:w-96 lg:w-96 shrink-0 border-r transition-transform duration-200 ease-out flex flex-col ${sidebarBg} ${
              isSidebarOpenOnMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
            } ${isSidebarCollapsedOnDesktop ? 'lg:hidden' : 'lg:flex'}`}
          >
            {/* Mobile drawer header */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-bold text-sm text-amber-800 dark:text-amber-400">
                  Hymn Index
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold">
                  560 Songs
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpenOnMobile(false)}
                className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-medium flex items-center gap-1 active:scale-95"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <HymnIndex
              hymns={hymns}
              selectedHymnId={selectedHymnId}
              onSelectHymn={handleSelectHymn}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              languageFilter={languageFilter}
              theme={theme}
            />
          </aside>

          {/* Right Side: Hymn Reader & Accompaniment View */}
          <section className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
            {/* Desktop-only toggle bar */}
            <div className="hidden lg:flex items-center justify-between px-4 py-2 border-b border-black/5 dark:border-white/5 text-xs opacity-75">
              <button
                onClick={() => setIsSidebarCollapsedOnDesktop(!isSidebarCollapsedOnDesktop)}
                className="flex items-center gap-1.5 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>{isSidebarCollapsedOnDesktop ? 'Show Song Index' : 'Hide Sidebar'}</span>
              </button>

              <div className="font-serif-hymn italic text-xs">
                Maga Maga C Seventh-day Adventist Church
              </div>
            </div>

            {/* Hymn View Content */}
            <div className="flex-1 overflow-hidden">
              <HymnView
                hymn={currentHymn}
                onPreviousHymn={handlePreviousHymn}
                onNextHymn={handleNextHymn}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                isFavorite={favorites.includes(currentHymn.id)}
                onToggleFavorite={toggleFavorite}
                onOpenPresentation={() => setIsPresentationOpen(true)}
                theme={theme}
              />
            </div>
          </section>
        </main>
      ) : (
        /* Sabbath School Lesson Quarterly View */
        <main className="flex-1 h-full overflow-hidden pb-14 lg:pb-0">
          <SabbathSchoolView
            theme={theme}
            onOpenHymnId={handleSelectHymnId}
          />
        </main>
      )}

      {/* Mobile Ergonomic Bottom Navigation Dock (Phones / Small screens < lg) */}
      <nav
        aria-label="Mobile Navigation"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg transition-colors pb-[env(safe-area-inset-bottom)] ${
          isDark
            ? 'bg-slate-950/95 border-slate-800 text-slate-300'
            : isSepia
            ? 'bg-[#f6eee0]/95 border-[#decbb0] text-[#4d3b27]'
            : 'bg-white/95 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
          {/* Hymn Reader */}
          <button
            onClick={() => {
              setActiveTab('hymnal');
              setIsSidebarOpenOnMobile(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'hymnal' && !isSidebarOpenOnMobile
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Hymn</span>
          </button>

          {/* Browse Index */}
          <button
            onClick={() => {
              setActiveTab('hymnal');
              setIsSidebarOpenOnMobile(true);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              isSidebarOpenOnMobile
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Browse</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              setActiveTab('hymnal');
              setLanguageFilter('Favorites');
              setIsSidebarOpenOnMobile(true);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors relative ${
              languageFilter === 'Favorites' && isSidebarOpenOnMobile
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <div className="relative mb-0.5">
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] leading-tight font-mono font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </div>
            <span>Favorites</span>
          </button>

          {/* Sabbath School Lesson */}
          <button
            onClick={() => {
              setActiveTab('sabbath-school');
              setIsSidebarOpenOnMobile(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'sabbath-school'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Quarterly</span>
          </button>

          {/* Order of Worship */}
          <button
            onClick={() => setIsWorshipModalOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium opacity-65 hover:opacity-100 transition-colors"
          >
            <Church className="w-5 h-5 mb-0.5 text-amber-600 dark:text-amber-400" />
            <span>Worship</span>
          </button>
        </div>
      </nav>

      {/* Sabbath Worship Order Guide Modal */}
      <WorshipOrderModal
        isOpen={isWorshipModalOpen}
        onClose={() => setIsWorshipModalOpen(false)}
        onSelectHymnId={handleSelectHymnId}
        theme={theme}
      />

      {/* Church Sanctuary Screen / Projector Mode Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        hymn={currentHymn}
        theme={theme}
      />
    </div>
  );
}
