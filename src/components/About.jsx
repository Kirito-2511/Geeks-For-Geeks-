import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export default function About() {
  const { data } = useContext(DataContext);
  const { content, stats, focusAreas } = data;

  return (
    <section id="about" className="border-b border-brand/10">
      {/* Section label */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.aboutLabel}
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
          {content.aboutHeadline}
        </h2>
      </div>

      {/* ── Bento Grid ────────────────────────────────────────────────── */}
      <div className="border-t border-brand/10">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map(({ id, value, label }, i) => (
            <div
              key={id}
              className={`px-6 md:px-10 py-10 md:py-14 ${
                i < stats.length - 1 ? 'border-r border-brand/10' : ''
              } border-b border-brand/10`}
            >
              <p className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-brand">
                {value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/40 mt-3">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Content bento */}
        <div className="grid md:grid-cols-3">
          {/* Large cell */}
          <div className="md:col-span-2 px-6 md:px-10 py-10 md:py-14 border-b md:border-b-0 md:border-r border-brand/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
              {content.aboutMissionHeadline}
            </p>
            <p className="text-lg md:text-2xl font-light text-brand/70 leading-relaxed max-w-xl whitespace-pre-line">
              {content.aboutMission}
            </p>
          </div>

          {/* Stacked cells */}
          <div className="flex flex-col">
            <div className="px-6 md:px-10 py-10 md:py-14 border-b border-brand/10 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
                {content.aboutFocusHeadline}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {focusAreas.map(({ id, label }) => (
                  <span
                    key={id}
                    className="px-3 py-1.5 border border-brand/15 text-[11px] font-bold uppercase tracking-widest text-brand/60"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-6 md:px-10 py-10 md:py-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
                {content.aboutOpenHeadline}
              </p>
              <p className="text-xl font-bold text-brand uppercase tracking-tight whitespace-pre-line">
                {content.aboutOpenSubHeadline1}
                <br />
                {content.aboutOpenSubHeadline2}
              </p>
              <p className="text-sm font-light text-brand/40 mt-2 whitespace-pre-line">
                {content.aboutOpenFooter}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
