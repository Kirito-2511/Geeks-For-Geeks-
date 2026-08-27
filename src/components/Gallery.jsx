import React, { useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { X, ChevronLeft, ChevronRight, Maximize2, LayoutGrid, Film } from 'lucide-react';

// Sub-component for an individual Event Carousel Row
function EventCarouselRow({ group, onSelectPhoto }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Event Header with Title and Scroll Arrows */}
      <div className="flex items-end justify-between gap-4 border-b border-brand/10 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand/40 block mb-1">
            Event Carousel • {group.items.length} {group.items.length === 1 ? 'Photo' : 'Photos'}
          </span>
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-brand">
            {group.title}
          </h3>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="p-2 md:p-2.5 rounded-full border border-brand/15 text-brand hover:bg-brand hover:text-canvas transition-all cursor-pointer hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="p-2 md:p-2.5 rounded-full border border-brand/15 text-brand hover:bg-brand hover:text-canvas transition-all cursor-pointer hover:scale-105"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track (Preserving Natural Aspect Ratio) */}
      <div
        ref={rowRef}
        className="flex gap-5 md:gap-6 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {group.items.map(({ id, media, label, originalIndex }) => (
          <div
            key={id}
            onClick={() => onSelectPhoto(originalIndex)}
            className="snap-center shrink-0 relative rounded-2xl overflow-hidden border border-brand/15 bg-brand/[0.02] shadow-sm hover:shadow-2xl hover:border-accent/50 transition-all duration-300 cursor-pointer group h-[280px] sm:h-[340px] md:h-[400px]"
          >
            {media ? (
              media.startsWith('data:video') ? (
                <video
                  src={media}
                  className="h-full w-auto max-w-[85vw] object-contain block transition-transform duration-700 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={media}
                  className="h-full w-auto max-w-[85vw] object-contain block transition-transform duration-700 group-hover:scale-105"
                  alt={label || group.title}
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-64 h-full bg-brand/10 flex items-center justify-center text-brand/30 text-xs font-bold uppercase tracking-widest">
                No Media
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4 md:p-5">
              <div className="flex justify-end">
                <span className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
              <div>
                <span className="text-canvas text-xs md:text-sm font-bold uppercase tracking-widest drop-shadow-md">
                  {label || 'View Photo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Gallery() {
  const { data } = useContext(DataContext);
  const { gallery, content } = data;
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewMode, setViewMode] = useState('collage'); // 'collage' | 'carousel'

  const handlePrev = useCallback(() => {
    if (gallery.length === 0) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  }, [gallery.length]);

  const handleNext = useCallback(() => {
    if (gallery.length === 0) return;
    setSelectedIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  }, [gallery.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  // Group items by eventTitle for Carousel mode
  const eventGroups = useMemo(() => {
    const map = new Map();
    gallery.forEach((item, idx) => {
      const title = item.eventTitle || 'Event 1: Highlights';
      if (!map.has(title)) {
        map.set(title, []);
      }
      map.get(title).push({ ...item, originalIndex: idx });
    });
    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      items,
    }));
  }, [gallery]);

  const currentItem = selectedIndex !== null ? gallery[selectedIndex] : null;

  return (
    <section id="gallery" className="border-b border-brand/10 pb-24">
      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto pt-20 pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.galleryLabel || 'GALLERY'}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
            {content.galleryHeadline || 'Moments\nthat matter'}
          </h2>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-brand/5 p-1.5 rounded-xl border border-brand/10 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('collage')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'collage'
                  ? 'bg-brand text-canvas shadow-sm'
                  : 'text-brand/60 hover:text-brand hover:bg-brand/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Collage</span>
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-brand text-canvas shadow-sm'
                  : 'text-brand/60 hover:text-brand hover:bg-brand/5'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Carousels</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Dynamic Layouts ─────────────────────────────────────────────── */}
      {viewMode === 'collage' ? (
        /* Masonry Collage View: Multi-column on mobile and desktop */
        <div className="px-3 sm:px-6 md:px-10 max-w-[1400px] mx-auto">
          {gallery.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-brand/20 rounded-2xl bg-brand/[0.01]">
              <p className="text-sm font-bold uppercase tracking-wider text-brand/60">
                No gallery photos added yet
              </p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 md:gap-6 space-y-3 sm:space-y-4 md:space-y-6">
              {gallery.map(({ id, media, label, eventTitle }, idx) => (
                <div
                  key={id}
                  onClick={() => setSelectedIndex(idx)}
                  className="gallery-item break-inside-avoid relative rounded-xl sm:rounded-2xl overflow-hidden border border-brand/15 bg-brand/[0.02] shadow-sm hover:shadow-xl hover:border-accent/50 transition-all duration-300 cursor-pointer group"
                >
                  {media ? (
                    media.startsWith('data:video') ? (
                      <video
                        src={media}
                        className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={media}
                        className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105"
                        alt={label || `Gallery item ${idx + 1}`}
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="w-full h-44 sm:h-64 bg-brand/10 flex items-center justify-center text-brand/30 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                      No Media
                    </div>
                  )}

                  {/* Hover / Tap overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3 sm:p-4 md:p-5">
                    <div className="flex justify-between items-start">
                      {eventTitle && (
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-canvas/90 backdrop-blur-sm border border-white/10 line-clamp-1 max-w-[80%]">
                          {eventTitle}
                        </span>
                      )}
                      <span className="p-1.5 sm:p-2 rounded-full bg-white/20 text-white backdrop-blur-sm shadow-md ml-auto">
                        <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    <div>
                      <span className="text-canvas text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider drop-shadow-md line-clamp-2">
                        {label || 'View Photo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Event Carousels View: Groups by Event Headings */
        <div className="px-4 sm:px-6 md:px-10 max-w-[1400px] mx-auto space-y-12 sm:space-y-16">
          {eventGroups.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-brand/20 rounded-2xl bg-brand/[0.01]">
              <p className="text-sm font-bold uppercase tracking-wider text-brand/60">
                No event carousels configured yet
              </p>
            </div>
          ) : (
            eventGroups.map((group, groupIdx) => (
              <EventCarouselRow
                key={groupIdx}
                group={group}
                onSelectPhoto={(idx) => setSelectedIndex(idx)}
              />
            ))
          )}
        </div>
      )}

      {/* ── Lightbox / Popup Modal ───────────────────────────────────────── */}
      {currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-fadeUp duration-200"
          onClick={handleClose}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Navigation Arrow */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          )}

          {/* Content Wrapper */}
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.media ? (
              currentItem.media.startsWith('data:video') ? (
                <video
                  src={currentItem.media}
                  controls
                  autoPlay
                  className="max-h-[78vh] max-w-full rounded-xl shadow-2xl object-contain bg-black/40"
                />
              ) : (
                <img
                  src={currentItem.media}
                  alt={currentItem.label || 'Gallery preview'}
                  className="max-h-[78vh] max-w-full rounded-xl shadow-2xl object-contain bg-black/40"
                />
              )
            ) : (
              <div className="w-80 h-80 bg-brand/20 rounded-lg flex items-center justify-center text-white/50 text-sm">
                No Media Available
              </div>
            )}

            {/* Caption & Counter */}
            <div className="mt-4 px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-center gap-3 text-white text-xs md:text-sm">
              {currentItem.eventTitle && (
                <span className="font-bold text-accent uppercase tracking-wider">
                  {currentItem.eventTitle}
                </span>
              )}
              {currentItem.eventTitle && currentItem.label && (
                <span className="text-white/30">•</span>
              )}
              <span className="font-semibold uppercase tracking-wider">
                {currentItem.label || 'Untitled'}
              </span>
              {gallery.length > 1 && (
                <span className="text-white/50 border-l border-white/20 pl-3">
                  {selectedIndex + 1} / {gallery.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
