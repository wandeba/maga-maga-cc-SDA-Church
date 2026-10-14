import React, { useState, useEffect } from 'react';
import { Heart, Share2, Copy, Check, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Monitor, Music, Printer, BookOpen, Sparkles } from 'lucide-react';
import { Hymn, ThemeMode, FontSize } from '../types/hymn';
import { AudioPlayerBar } from './AudioPlayerBar';

interface HymnViewProps {
  hymn: Hymn;
  onPreviousHymn: () => void;
  onNextHymn: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onOpenPresentation: () => void;
  theme: ThemeMode;
}

export const HymnView: React.FC<HymnViewProps> = ({
  hymn,
  onPreviousHymn,
  onNextHymn,
  hasPrevious,
  hasNext,
  isFavorite,
  onToggleFavorite,
  onOpenPresentation,
  theme
}) => {
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [copied, setCopied] = useState(false);

  // Touch swipe gesture for phones (swipe left = next, swipe right = previous)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Must be a distinct horizontal swipe (> 50px) and more horizontal than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0 && hasNext) {
        onNextHymn();
      } else if (deltaX > 0 && hasPrevious) {
        onPreviousHymn();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };


  const handleCopy = () => {
    const fullText = `#${hymn.id} ${hymn.title}\nMaga Maga C SDA Church Hymnal\n\n${hymn.lyrics}${
      hymn.author ? `\n\nAuthor: ${hymn.author}` : ''
    }${hymn.reference ? `\nReference: ${hymn.reference}` : ''}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const shareTitle = `#${hymn.id} ${hymn.title} - Maga Maga C SDA Hymnal`;
    const shareText = `#${hymn.id} ${hymn.title}\nMaga Maga C Seventh-day Adventist Church Hymnal\n\n${hymn.lyrics}${
      hymn.author ? `\n\nAuthor: ${hymn.author}` : ''
    }${hymn.reference ? `\nReference: ${hymn.reference}` : ''}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err: unknown) {
        // Only ignore intentional cancellation by the user
        if ((err as Error)?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(shareText);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
          } catch (_) {}
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      // Fallback for browsers without Web Share API support
      try {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (_) {}
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  const fontSizes: Record<FontSize, string> = {
    sm: 'text-base leading-relaxed',
    md: 'text-lg leading-relaxed',
    lg: 'text-xl leading-loose',
    xl: 'text-2xl leading-loose',
    '2xl': 'text-3xl leading-loose'
  };

  const stepFontSize = (direction: 'up' | 'down') => {
    const order: FontSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    const idx = order.indexOf(fontSize);
    if (direction === 'up' && idx < order.length - 1) {
      setFontSize(order[idx + 1]);
    } else if (direction === 'down' && idx > 0) {
      setFontSize(order[idx - 1]);
    }
  };

  // Format lyrics stanzas, choruses, and call-and-response cues
  const formattedSections = hymn.lyrics.split(/\n\s*\n/).filter(s => s.trim().length > 0);

  const containerBg = isDark
    ? 'bg-slate-950 text-slate-100'
    : isSepia
    ? 'bg-[#fcf7ee] text-[#342717]'
    : 'bg-white text-slate-900';

  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800'
    : isSepia
    ? 'bg-[#f5ede0]/70 border-[#d8c7ad]'
    : 'bg-amber-50/40 border-amber-200/60';

  const chorusBorder = isDark
    ? 'border-amber-500/50 bg-amber-950/20 text-amber-200'
    : isSepia
    ? 'border-amber-700/50 bg-[#efe2cd] text-[#3f2910]'
    : 'border-amber-600/50 bg-amber-50/80 text-amber-950';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`h-full overflow-y-auto p-3 sm:p-8 pb-32 sm:pb-12 transition-colors ${containerBg}`}
    >
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Hymn Header Bar */}
        <div className={`rounded-2xl border p-4 sm:p-6 shadow-sm backdrop-blur-sm ${cardBg}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold uppercase tracking-wider ${
                  hymn.id === 0
                    ? 'bg-purple-600 text-white'
                    : hymn.language === 'Juba Arabic'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {hymn.id === 0 ? 'Preface' : `Hymn #${hymn.id}`}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 opacity-75">
                {hymn.category}
              </span>
              {hymn.key && (
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  {hymn.key}
                </span>
              )}
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-1.5">
              {/* Font Sizer */}
              <div className="flex items-center rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-0.5">
                <button
                  onClick={() => stepFontSize('down')}
                  className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
                  title="Decrease Font Size"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] px-1 font-mono uppercase font-bold opacity-75">{fontSize}</span>
                <button
                  onClick={() => stepFontSize('up')}
                  className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
                  title="Increase Font Size"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Favorite Toggle */}
              <button
                onClick={() => onToggleFavorite(hymn.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  isFavorite
                    ? 'bg-red-500/10 border-red-500/30 text-red-500'
                    : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
                title={isFavorite ? 'Remove from favorites (Shortcut: F)' : 'Add to favorites (Shortcut: F)'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button (Web Share API) */}
              <button
                onClick={handleShare}
                className={`p-2 rounded-xl border transition-colors ${
                  shared
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
                title={shared ? 'Hymn shared / copied!' : 'Share Hymn (Title & Lyrics)'}
              >
                {shared ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Copy Lyrics */}
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl border border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 transition-colors"
                title="Copy Hymn Lyrics"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl border border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 transition-colors hidden sm:block"
                title="Print Hymn"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Projector / Presentation Mode */}
              <button
                onClick={onOpenPresentation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-transform active:scale-95"
                title="Church Screen Projector Mode"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Projector</span>
              </button>
            </div>
          </div>

          {/* Hymn Title & Details */}
          <div>
            <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-amber-900 dark:text-amber-400">
              {hymn.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs opacity-80 font-serif-hymn italic">
              {hymn.author && <span>Composed / Written by: <strong className="font-sans not-italic font-medium">{hymn.author}</strong></span>}
              {hymn.reference && <span>Reference: <strong className="font-mono not-italic">{hymn.reference}</strong></span>}
              <span>Language: <strong className="font-sans not-italic">{hymn.language}</strong></span>
            </div>
          </div>
        </div>

        {/* Floating/Integrated Audio Accompaniment Bar */}
        <AudioPlayerBar currentHymn={hymn} theme={theme} />

        {/* Lyrics Section */}
        <div className={`rounded-2xl border p-6 sm:p-10 shadow-sm ${cardBg}`}>
          <div className={`space-y-6 font-serif-hymn ${fontSizes[fontSize]}`}>
            {formattedSections.map((section, idx) => {
              const trimmed = section.trim();
              const isChorus = trimmed.toLowerCase().startsWith('chorus') || trimmed.toLowerCase().includes('refrain');

              return (
                <div
                  key={idx}
                  className={`transition-all ${
                    isChorus
                      ? `pl-4 sm:pl-6 py-3 my-4 border-l-4 rounded-r-xl ${chorusBorder}`
                      : 'leading-relaxed'
                  }`}
                >
                  {trimmed.split('\n').map((line, lineIdx) => {
                    // Check for vocal cues like Solo:, Bass:, Kulu:, All:
                    const hasSolo = line.includes('Solo:');
                    const hasBass = line.includes('Bass:');
                    const hasKulu = line.includes('Kulu:');
                    const isChorusHeader = line.toLowerCase().startsWith('chorus');

                    if (isChorusHeader) {
                      return (
                        <div
                          key={lineIdx}
                          className="font-sans font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1"
                        >
                          {line}
                        </div>
                      );
                    }

                    return (
                      <p
                        key={lineIdx}
                        className={`whitespace-pre-wrap ${
                          hasSolo
                            ? 'font-medium text-amber-800 dark:text-amber-300'
                            : hasBass
                            ? 'font-medium text-blue-700 dark:text-blue-300'
                            : hasKulu
                            ? 'font-semibold text-emerald-800 dark:text-emerald-300'
                            : ''
                        }`}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation (Previous / Next Song) */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onPreviousHymn}
            disabled={!hasPrevious}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl border text-xs sm:text-sm font-medium transition-all active:scale-95 ${
              hasPrevious
                ? 'hover:bg-amber-600/10 hover:border-amber-500/40 text-amber-800 dark:text-amber-300 cursor-pointer'
                : 'opacity-40 cursor-not-allowed border-transparent'
            }`}
            title="Previous Song (Shortcut: Left Arrow ← or Swipe Right)"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Previous</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/5 dark:bg-white/10 opacity-70">←</kbd>
          </button>

          <div className="text-xs opacity-60 text-center font-mono flex flex-col items-center">
            <span>#{hymn.id} / 560</span>
            <span className="text-[10px] opacity-75 sm:hidden font-sans">Swipe to turn</span>
          </div>

          <button
            onClick={onNextHymn}
            disabled={!hasNext}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl border text-xs sm:text-sm font-medium transition-all active:scale-95 ${
              hasNext
                ? 'hover:bg-amber-600/10 hover:border-amber-500/40 text-amber-800 dark:text-amber-300 cursor-pointer'
                : 'opacity-40 cursor-not-allowed border-transparent'
            }`}
            title="Next Song (Shortcut: Right Arrow → or Swipe Left)"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/5 dark:bg-white/10 opacity-70">→</kbd>
            <span>Next</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
