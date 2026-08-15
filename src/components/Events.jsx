import React, { useContext } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function Events() {
  const { data } = useContext(DataContext);
  const { events, content } = data;

  return (
    <section id="events" className="border-b border-brand/10">
      {/* Section header */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.eventsLabel}
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
          {content.eventsHeadline}
        </h2>
      </div>

      {/* Event rows */}
      <div className="border-t border-brand/10">
        {events.map(({ id, date, title, type, status }) => {
          const dateParts = date.split(' ');
          const month = dateParts[0] || '';
          const day = dateParts[1] || '';

          return (
            <a
              key={id}
              href="#"
              className="group flex items-center gap-4 md:gap-8 px-6 md:px-10 py-6 md:py-8 border-b border-brand/10 hover:bg-brand/[0.02] transition-colors duration-300 cursor-pointer"
            >
              {/* Date */}
              <div className="w-20 md:w-28 shrink-0">
                <p className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-brand leading-none">
                  {month}
                </p>
                <p className="text-lg md:text-2xl font-black uppercase tracking-tighter text-brand/40 leading-none">
                  {day}
                </p>
              </div>

              {/* Vertical divider */}
              <div className="w-px h-12 bg-brand/10 hidden md:block" />

              {/* Title & meta */}
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-xl font-bold text-brand tracking-tight truncate group-hover:text-accent transition-colors duration-200">
                  {title}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/30">
                    {type}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                    {status}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowUpRight
                size={20}
                className="shrink-0 text-brand/20 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}
