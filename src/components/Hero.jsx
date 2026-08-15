import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export default function Hero() {
  const { data } = useContext(DataContext);
  const { content } = data;

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-center px-6 md:px-10 pt-12 pb-12 max-w-[1400px] mx-auto"
      >
        <div className="flex-1 flex flex-col justify-center">
          {/* Overline */}
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-6 whitespace-pre-line">
            {content.heroOverline}
          </p>

          {/* Massive Headline */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-10xl font-black uppercase leading-[0.85] tracking-tighter text-brand">
            {content.heroHeadline1}
            <br />
            <span className="text-accent">{content.heroHeadline2}</span>
          </h1>

          {/* Subcopy */}
          <p className="mt-8 max-w-lg text-base md:text-lg font-light text-brand/50 leading-relaxed whitespace-pre-line">
            {content.heroSubcopy}
          </p>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────────────────── */}
      <div className="w-full bg-accent overflow-hidden py-4 border-y border-brand/20">
        <div className="marquee-track">
          {/* Duplicate the text for seamless loop */}
          {[0, 1].map((i) => (
            <span
              key={i}
              className="text-canvas text-sm md:text-base font-bold uppercase tracking-[0.3em] whitespace-nowrap px-4"
            >
              {content.marqueeText.repeat(4)}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
