import React, { useContext, useState, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery() {
  const { data } = useContext(DataContext);
  const { gallery, content } = data;
  const [selectedIndex, setSelectedIndex] = useState(null);

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

  const currentItem = selectedIndex !== null ? gallery[selectedIndex] : null;

  return (
    <section id="gallery" className="border-b border-brand/10">
      {/* Section header */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.galleryLabel}
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
          {content.galleryHeadline}
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-px bg-brand/10 border-t border-brand/10">
        {gallery.map(({ id, span, media, label }, idx) => (
          <div
            key={id}
            onClick={() => setSelectedIndex(idx)}
            className={`gallery-item relative overflow-hidden cursor-pointer group ${span || 'col-span-1 row-span-1'}`}
          >
            {media ? (
              media.startsWith('data:video') ? (
                <video
                  src={media}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={media}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={label}
                />
              )
            ) : (
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 bg-brand/10" />
            )}

            {/* Overlay label */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-end p-4 md:p-6">
              <span className="text-canvas text-xs md:text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Popup Modal */}
      {currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8 animate-fadeUp duration-200"
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
                  className="max-h-[75vh] max-w-full rounded-lg shadow-2xl object-contain bg-black/40"
                />
              ) : (
                <img
                  src={currentItem.media}
                  alt={currentItem.label || 'Gallery preview'}
                  className="max-h-[75vh] max-w-full rounded-lg shadow-2xl object-contain bg-black/40"
                />
              )
            ) : (
              <div className="w-80 h-80 bg-brand/20 rounded-lg flex items-center justify-center text-white/50 text-sm">
                No Media Available
              </div>
            )}

            {/* Caption & Counter */}
            <div className="mt-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-3 text-white text-xs md:text-sm">
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
