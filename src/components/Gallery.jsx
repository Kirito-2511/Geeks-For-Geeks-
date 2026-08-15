import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export default function Gallery() {
  const { data } = useContext(DataContext);
  const { gallery, content } = data;

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
        {gallery.map(({ id, span, media, label }) => (
          <div
            key={id}
            className={`gallery-item relative overflow-hidden cursor-pointer group ${span || 'col-span-1 row-span-1'}`}
          >
            {media ? (
              media.startsWith('data:video') ? (
                 <video src={media} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" autoPlay muted loop playsInline />
              ) : (
                 <img src={media} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={label} />
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
    </section>
  );
}
