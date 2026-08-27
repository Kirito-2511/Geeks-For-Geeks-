import React, { useContext, useState, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { sanitizeUrl } from '../utils/sanitize';

// Utility to normalize any date string to YYYY-MM-DD
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const mKey = parts[0].toLowerCase().slice(0, 3);
    const m = months[mKey];
    const d = String(parseInt(parts[1], 10) || 1).padStart(2, '0');
    const y = parts[2] ? parts[2] : new Date().getFullYear();
    if (m) return `${y}-${m}-${d}`;
  }
  return dateStr;
}

// Format date for display
function formatEventDate(dateStr) {
  const norm = normalizeDate(dateStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(norm)) {
    const [year, month, day] = norm.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return {
      norm,
      year,
      monthName: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      dayNum: String(day).padStart(2, '0'),
      fullDate: norm,
      readable: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }
  return {
    norm: dateStr,
    year: '',
    monthName: dateStr.split(' ')[0] || 'DATE',
    dayNum: dateStr.split(' ')[1] || '',
    fullDate: dateStr,
    readable: dateStr
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Events() {
  const { data } = useContext(DataContext);
  const { events, content } = data;

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedEventId, setHighlightedEventId] = useState(null);

  // Initialize calendar view around first event date or current date
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => {
    if (events && events.length > 0) {
      const firstDate = normalizeDate(events[0].date);
      if (/^\d{4}-\d{2}-\d{2}$/.test(firstDate)) {
        const [y, m] = firstDate.split('-').map(Number);
        return new Date(y, m - 1, 1);
      }
    }
    return new Date();
  });

  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();

  // Map of event counts and events by normalized date
  const eventsByDate = useMemo(() => {
    const map = new Map();
    (events || []).forEach((ev) => {
      const nDate = normalizeDate(ev.date);
      if (nDate) {
        if (!map.has(nDate)) map.set(nDate, []);
        map.get(nDate).push(ev);
      }
    });
    return map;
  }, [events]);

  // Calendar matrix calculation
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
      const prevYear = calMonth === 0 ? calYear - 1 : calYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Next month padding (complete grid up to multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
      const nextYear = calMonth === 11 ? calYear + 1 : calYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        events: eventsByDate.get(dateStr) || []
      });
    }

    return days;
  }, [calYear, calMonth, eventsByDate]);

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(calYear, calMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(calYear, calMonth + 1, 1));
  };

  // When clicking a day on the calendar
  const handleDateClick = (dayObj) => {
    setSelectedDate(dayObj.dateStr);

    if (dayObj.events && dayObj.events.length > 0) {
      const firstEvent = dayObj.events[0];
      setHighlightedEventId(firstEvent.id);

      // Scroll smoothly to the target event
      setTimeout(() => {
        const targetEl = document.getElementById(`event-${firstEvent.id}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      // Clear highlight effect after 2.5 seconds
      setTimeout(() => {
        setHighlightedEventId(null);
      }, 2500);
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return (events || []).filter((ev) => {
      if (activeFilter === 'UPCOMING') {
        const status = (ev.status || '').toLowerCase();
        if (status.includes('completed') || status.includes('past')) return false;
      } else if (activeFilter === 'COMPLETED') {
        const status = (ev.status || '').toLowerCase();
        if (!status.includes('completed') && !status.includes('past')) return false;
      }

      if (selectedDate) {
        if (normalizeDate(ev.date) !== selectedDate) return false;
      }

      return true;
    });
  }, [events, activeFilter, selectedDate]);

  // Status badge style helper
  const getStatusBadge = (status) => {
    const s = (status || 'Upcoming').toLowerCase();
    if (s.includes('completed') || s.includes('past')) {
      return 'bg-brand/10 text-brand/60 border border-brand/20';
    }
    if (s.includes('live') || s.includes('registration')) {
      return 'bg-amber-500/10 text-amber-600 border border-amber-500/30';
    }
    return 'bg-accent/15 text-accent border border-accent/30 font-bold';
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <section id="events" className="border-b border-brand/10 pb-20">
      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto pt-20 pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.eventsLabel || 'SCHEDULE'}
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
            {content.eventsHeadline || 'Upcoming & Past Events'}
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-brand/5 p-1 rounded-lg border border-brand/10 self-start md:self-auto">
            {['ALL', 'UPCOMING', 'COMPLETED'].map((tab) => {
              const isActive = activeFilter === tab;
              const count = (events || []).filter((e) => {
                const s = (e.status || '').toLowerCase();
                if (tab === 'UPCOMING') return !s.includes('completed') && !s.includes('past');
                if (tab === 'COMPLETED') return s.includes('completed') || s.includes('past');
                return true;
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveFilter(tab);
                    setSelectedDate(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-brand text-canvas shadow-sm'
                      : 'text-brand/60 hover:text-brand hover:bg-brand/5'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-canvas/20 text-canvas' : 'bg-brand/10 text-brand/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Section: Timeline + Interactive Calendar ────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* ── Left Column: Event Timeline ──────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            {/* Active Date Filter Banner */}
            {selectedDate && (
              <div className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm font-semibold text-brand">
                    Showing events for <strong className="underline">{selectedDate}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent underline transition-colors cursor-pointer"
                >
                  View All Dates
                </button>
              </div>
            )}

            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-brand/20 rounded-2xl bg-brand/[0.01]">
                <CalendarIcon className="w-12 h-12 text-brand/20 mx-auto mb-4" />
                <p className="text-base font-bold uppercase tracking-wider text-brand/60">
                  No events found
                </p>
                <p className="text-xs text-brand/40 mt-1">
                  {selectedDate
                    ? 'No events match the selected calendar date.'
                    : 'Check back later or switch filter tabs.'}
                </p>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="mt-4 px-4 py-2 bg-brand text-canvas text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    Reset Date Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="relative pl-6 md:pl-10 space-y-8">
                {/* Continuous Timeline Line */}
                <div className="absolute left-[9px] md:left-[13px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand/30 via-brand/20 to-brand/5" />

                {filteredEvents.map((event) => {
                  const dateInfo = formatEventDate(event.date);
                  const isHighlighted = highlightedEventId === event.id;

                  return (
                    <div
                      key={event.id}
                      id={`event-${event.id}`}
                      className={`relative group transition-all duration-300 ${
                        isHighlighted ? 'event-target-highlight' : ''
                      }`}
                    >
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-[20px] md:-left-[24px] top-6 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all duration-300 ${
                          isHighlighted
                            ? 'bg-accent border-accent scale-150 shadow-[0_0_12px_rgba(76,175,80,0.8)]'
                            : 'bg-canvas border-brand group-hover:border-accent group-hover:bg-accent group-hover:scale-125'
                        }`}
                      />

                      {/* Event Card */}
                      <div className="bg-canvas border border-brand/15 group-hover:border-accent/40 rounded-xl p-5 md:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
                        {/* Top Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          {/* Date Pill */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-wider text-brand/70 bg-brand/5 px-2.5 py-1 rounded-md border border-brand/10">
                              {dateInfo.fullDate}
                            </span>
                            {dateInfo.readable !== dateInfo.fullDate && (
                              <span className="text-[11px] font-semibold text-brand/40 hidden sm:inline">
                                ({dateInfo.readable})
                              </span>
                            )}
                          </div>

                          {/* Status & Type Badges */}
                          <div className="flex items-center gap-2">
                            {event.type && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand/5 text-brand/70 border border-brand/10">
                                {event.type}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusBadge(
                                event.status
                              )}`}
                            >
                              {event.status || 'Upcoming'}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg md:text-2xl font-black text-brand tracking-tight leading-snug group-hover:text-accent transition-colors duration-200">
                          {event.title}
                        </h3>

                        {/* Location & Time Info */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 text-xs md:text-sm text-brand/70">
                          {event.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-accent shrink-0" />
                              <span className="font-medium">{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-accent shrink-0" />
                              <span className="font-medium">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="mt-3 text-xs md:text-sm font-normal text-brand/60 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Link / Action Button if provided */}
                        {sanitizeUrl(event.link) && event.link !== '#' && (
                          <div className="mt-5 pt-4 border-t border-brand/10 flex items-center justify-between">
                            <a
                              href={sanitizeUrl(event.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors"
                            >
                              <span>Event Details & Registration</span>
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right Column: Interactive Highlighted Calendar ────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="bg-canvas border border-brand/15 rounded-2xl p-6 md:p-7 shadow-sm">
              {/* Calendar Header with Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand/40 block">
                    Interactive Calendar
                  </span>
                  <h4 className="text-xl md:text-2xl font-black text-brand tracking-tight">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="p-2 rounded-lg border border-brand/15 text-brand hover:bg-brand hover:text-canvas transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="p-2 rounded-lg border border-brand/15 text-brand hover:bg-brand hover:text-canvas transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {WEEKDAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-[11px] font-bold uppercase tracking-wider text-brand/40 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarGrid.map((cell, idx) => {
                  const hasEvents = cell.events && cell.events.length > 0;
                  const isSelected = selectedDate === cell.dateStr;
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(cell)}
                      className={`relative h-11 md:h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-brand text-canvas font-black ring-2 ring-accent ring-offset-2 scale-105 shadow-md z-10'
                          : hasEvents
                          ? 'bg-accent/15 text-brand font-black border border-accent/40 hover:bg-accent hover:text-canvas hover:scale-105 shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-brand/80 hover:bg-brand/5 font-medium'
                          : 'text-brand/20 hover:text-brand/40 font-light'
                      } ${isToday && !isSelected ? 'ring-1 ring-brand/40' : ''}`}
                    >
                      <span className="text-xs md:text-sm leading-none">{cell.dayNum}</span>

                      {/* Event Dot Marker */}
                      {hasEvents && (
                        <span
                          className={`mt-1 w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-canvas'
                              : 'bg-accent'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Footer Info & Clear Selection */}
              <div className="mt-6 pt-4 border-t border-brand/10 flex items-center justify-between">
                <span className="text-[11px] text-brand/50">
                  {eventsByDate.size} event days scheduled
                </span>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs font-bold text-accent hover:text-brand underline transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
