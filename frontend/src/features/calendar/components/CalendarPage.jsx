'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays, Clock, MapPin, Gift, GraduationCap, Info } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import { fetchEvents, fetchEventById, fetchHolidays, fetchEmployeeBirthdays, fetchEmployeeAnniversaries, fetchEventTypes } from '@/features/calendar/calendarAPI';
import Loader from '@/components/common/Loader';
import MarkdownIt from 'markdown-it';
import 'react-calendar/dist/Calendar.css';

const md = new MarkdownIt().disable(['image']);

const renderDescription = (description) => {
  if (!description) return '';
  // Remove HTML tags and any markdown/URL image patterns before rendering text.
  const withoutHtml = description.replace(/<[^>]*>/g, '');
  const withoutMarkdownImages = withoutHtml
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, '');
  const withoutImageUrls = withoutMarkdownImages.replace(
    new RegExp('https?:\\/\\/\\S+\\.(?:png|jpe?g|gif|webp|svg)(?:\\?\\S*)?', 'gi'),
    ''
  );
  return md.render(withoutImageUrls);
};

const VIEW_MODES = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

function toDateKey(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toMonthKey(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseDateForCalendar(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const localDate = new Date(y, m - 1, d);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Get minutes from midnight for the given date (0–1440). Uses start_date/end_date; if no time, returns null (all-day). */
function getEventMinutes(ev, dayDate) {
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  if (ev.start_date) {
    const start = new Date(ev.start_date);
    if (start >= dayEnd || start < dayStart) return null;
    const minutes = start.getHours() * 60 + start.getMinutes();
    return minutes;
  }
  return null;
}

function getEventEndMinutes(ev, dayDate) {
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  if (ev.end_date) {
    const end = new Date(ev.end_date);
    const endMinutes = end >= dayEnd ? 24 * 60 : end.getHours() * 60 + end.getMinutes();
    return endMinutes;
  }
  const startM = getEventMinutes(ev, dayDate);
  return startM != null ? startM + 60 : 60; // default 1 hr or all-day 9–10
}

/** Events for day view with layout: { ev, startMinutes, endMinutes, topPct, heightPct } */
function layoutDayEvents(events, dayDate) {
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);
  const totalMinutes = 24 * 60;
  return events
    .map((ev) => {
      const startM = getEventMinutes(ev, dayDate);
      const endM = getEventEndMinutes(ev, dayDate);
      if (startM == null) return { ev, allDay: true, startMinutes: 0, endMinutes: 60, topPct: 0, heightPct: (60 / totalMinutes) * 100 };
      const topPct = (startM / totalMinutes) * 100;
      const duration = Math.max(15, endM - startM);
      const heightPct = (duration / totalMinutes) * 100;
      return { ev, allDay: false, startMinutes: startM, endMinutes: endM, topPct, heightPct };
    })
    .sort((a, b) => (a.allDay ? -1 : a.startMinutes) - (b.allDay ? -1 : b.startMinutes));
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const requestedEventId = searchParams.get('eventId');
  const requestedDateRaw = searchParams.get('date');
  const requestedDate = useMemo(() => parseDateForCalendar(requestedDateRaw), [requestedDateRaw]);

  const [viewMode, setViewMode] = useState('month');
  const [activeDate, setActiveDate] = useState(() => requestedDate || new Date());
  const [activeStartDate, setActiveStartDate] = useState(() => {
    const d = requestedDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [calendarView, setCalendarView] = useState('month');
  const [eventsList, setEventsList] = useState([]);
  const [holidaysList, setHolidaysList] = useState([]);
  const [birthdaysList, setBirthdaysList] = useState([]);
  const [anniversariesList, setAnniversariesList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);
  const [anniversariesLoading, setAnniversariesLoading] = useState(true);
  const [categoryLegend, setCategoryLegend] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [pendingSelectedEventId, setPendingSelectedEventId] = useState(() => requestedEventId || null);

  useEffect(() => {
    if (requestedDate) {
      setActiveDate(requestedDate);
      setActiveStartDate(new Date(requestedDate.getFullYear(), requestedDate.getMonth(), 1));
      setViewMode('month');
      setCalendarView('month');
    }
    setPendingSelectedEventId(requestedEventId || null);
  }, [requestedDate, requestedEventId]);

  useEffect(() => {
    fetchEventTypes().then((types) => setCategoryLegend(types)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    fetchEvents()
      .then((list) => {
        if (!cancelled) setEventsList(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setEventsList([]);
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHolidaysLoading(true);
    fetchHolidays()
      .then((list) => {
        if (!cancelled) setHolidaysList(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setHolidaysList([]);
      })
      .finally(() => {
        if (!cancelled) setHolidaysLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBirthdaysLoading(true);
    fetchEmployeeBirthdays()
      .then((list) => {
        if (!cancelled) setBirthdaysList(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setBirthdaysList([]);
      })
      .finally(() => {
        if (!cancelled) setBirthdaysLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAnniversariesLoading(true);
    fetchEmployeeAnniversaries()
      .then((list) => {
        if (!cancelled) setAnniversariesList(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setAnniversariesList([]);
      })
      .finally(() => {
        if (!cancelled) setAnniversariesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setExpandedEventId(null);
    setExpandedEvent(null);
    setDetailLoading(false);
  }, [activeDate]);

  const hourGridRef = useRef(null);

  const eventsByDate = useMemo(() => {
    const map = {};
    (eventsList || []).forEach((ev) => {
      const key = ev.date;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    
    // Add birthdays
    (birthdaysList || []).forEach((birthday) => {
      const key = birthday.date;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(birthday);
    });
    
    // Add anniversaries
    (anniversariesList || []).forEach((anniversary) => {
      const key = anniversary.date;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(anniversary);
    });
    
    return map;
  }, [eventsList, birthdaysList, anniversariesList]);

  const holidayDates = useMemo(
    () => new Map((holidaysList || []).filter((h) => h.date).map((h) => [h.date, h.title || 'Holiday'])),
    [holidaysList]
  );

  const eventsByMonth = useMemo(() => {
    const map = {};
    
    // Count regular events
    (eventsList || []).forEach((ev) => {
      if (!ev.date) return;
      const monthKey = ev.date.slice(0, 7);
      map[monthKey] = (map[monthKey] || 0) + 1;
    });
    
    // Count birthdays
    (birthdaysList || []).forEach((birthday) => {
      if (!birthday.date) return;
      const monthKey = birthday.date.slice(0, 7);
      map[monthKey] = (map[monthKey] || 0) + 1;
    });
    
    // Count anniversaries
    (anniversariesList || []).forEach((anniversary) => {
      if (!anniversary.date) return;
      const monthKey = anniversary.date.slice(0, 7);
      map[monthKey] = (map[monthKey] || 0) + 1;
    });
    
    return map;
  }, [eventsList, birthdaysList, anniversariesList]);

  const holidaysByMonth = useMemo(() => {
    const map = {};
    (holidaysList || []).forEach((h) => {
      if (!h.date) return;
      const d = new Date(h.date);
      const monthKey = toMonthKey(d);
      map[monthKey] = (map[monthKey] || 0) + 1;
    });
    return map;
  }, [holidaysList]);

  const isDataLoading = eventsLoading || holidaysLoading || birthdaysLoading || anniversariesLoading;

  const currentEvents = useMemo(() => {
    const key = toDateKey(activeDate);
    return eventsByDate[key] || [];
  }, [activeDate, eventsByDate]);

  const dayViewLayout = useMemo(
    () => layoutDayEvents(currentEvents, activeDate),
    [currentEvents, activeDate]
  );

  const allDayEvents = useMemo(() => dayViewLayout.filter((x) => x.allDay), [dayViewLayout]);
  const timedEvents = useMemo(() => dayViewLayout.filter((x) => !x.allDay), [dayViewLayout]);

  const currentDayHoliday = useMemo(() => {
    const key = toDateKey(activeDate);
    return holidayDates.get(key) ?? null;
  }, [activeDate, holidayDates]);

  const isToday = useMemo(() => {
    const t = new Date();
    return activeDate.getDate() === t.getDate() && activeDate.getMonth() === t.getMonth() && activeDate.getFullYear() === t.getFullYear();
  }, [activeDate]);

  const nowMinutes = useMemo(() => {
    if (!isToday) return null;
    const t = new Date();
    return t.getHours() * 60 + t.getMinutes();
  }, [isToday]);

  useEffect(() => {
    if (viewMode !== 'day' || !hourGridRef.current) return;
    // Scroll to 1 hour before current time, or default to 8 AM
    const scrollTarget = nowMinutes != null
      ? Math.max(0, ((nowMinutes - 60) / (24 * 60)) * (24 * 56))
      : 8 * 56;
    hourGridRef.current.scrollTop = scrollTarget;
  }, [viewMode, activeDate, nowMinutes]);

  const currentHolidays = useMemo(() => {
    return (holidaysList || []).filter((h) => {
      if (!h.date) return false;
      const d = new Date(h.date);
      const ay = d.getFullYear();
      const am = d.getMonth();
      const ad = activeDate.getFullYear();
      const bm = activeDate.getMonth();
      return ay === ad && am === bm;
    });
  }, [activeDate, holidaysList]);

  const headerLabel = useMemo(() => {
    if (viewMode === 'day') {
      return activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'year') {
      return String(activeStartDate.getFullYear());
    }
    return activeStartDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewMode, activeDate, activeStartDate]);

  const goPrev = () => {
    if (viewMode === 'day') {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
    } else if (viewMode === 'year') {
      const next = new Date(activeStartDate.getFullYear() - 1, activeStartDate.getMonth(), 1);
      setActiveStartDate(next);
      setActiveDate(next);
    } else {
      const next = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() - 1, 1);
      setActiveStartDate(next);
      setActiveDate(next);
    }
  };
  const goNext = () => {
    if (viewMode === 'day') {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
    } else if (viewMode === 'year') {
      const next = new Date(activeStartDate.getFullYear() + 1, activeStartDate.getMonth(), 1);
      setActiveStartDate(next);
      setActiveDate(next);
    } else {
      const next = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 1);
      setActiveStartDate(next);
      setActiveDate(next);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setCalendarView(mode === 'year' ? 'year' : 'month');
    if (mode === 'day') {
      setActiveDate(activeDate);
    } else if (mode === 'year') {
      setActiveStartDate(new Date(activeDate.getFullYear(), 0, 1));
    } else {
      setActiveStartDate(new Date(activeDate.getFullYear(), activeDate.getMonth(), 1));
    }
  };

  const handleYearViewMonthClick = (date) => {
    setActiveStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setActiveDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setViewMode('month');
    setCalendarView('month');
  };

  const handleToggleEvent = (ev) => {
    const id = ev.documentId ?? ev.id;
    if (!id) return;
    if (String(expandedEventId) === String(id)) {
      setExpandedEventId(null);
      setExpandedEvent(null);
      setDetailLoading(false);
      return;
    }
    setExpandedEventId(id);
    setExpandedEvent(null);
    setDetailLoading(true);
    if (ev.type === 'birthday' || ev.type === 'anniversary') {
      setExpandedEvent(ev);
      setDetailLoading(false);
    } else {
      fetchEventById(id)
        .then((data) => setExpandedEvent(data))
        .catch(() => setExpandedEvent(null))
        .finally(() => setDetailLoading(false));
    }
  };

  useEffect(() => {
    if (!pendingSelectedEventId || eventsLoading) return;

    const match = (eventsList || []).find(
      (ev) => String(ev.documentId ?? ev.id) === String(pendingSelectedEventId)
    );

    if (!match) return;

    const dateFromEvent = parseDateForCalendar(match.date);
    if (dateFromEvent) {
      setActiveDate(dateFromEvent);
      setActiveStartDate(new Date(dateFromEvent.getFullYear(), dateFromEvent.getMonth(), 1));
      setViewMode('month');
      setCalendarView('month');
    }

    const id = match.documentId ?? match.id;
    setExpandedEventId(id);
    setExpandedEvent(null);
    setDetailLoading(true);

    fetchEventById(id)
      .then((data) => setExpandedEvent(data || match))
      .catch(() => setExpandedEvent(match))
      .finally(() => {
        setDetailLoading(false);
        setPendingSelectedEventId(null);
      });
  }, [pendingSelectedEventId, eventsLoading, eventsList]);

  const calendarBgStyle = {
    backgroundImage: 'url(/gallery-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen" style={calendarBgStyle}>
      <PageHeader
        title="Calendar"
        breadcrumbs={[{ label: 'Calendar' }]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-4 px-xl bg-transparent"
      >
        <p className="text-body text-muted-foreground">
          Stay on top of events, deadlines, and celebrations
        </p>
      </PageHeader>

      <PageContainer className="pb-xl px-xl">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-8">
          {/* Left: Calendar */}
          <div className="flex-1 min-w-0" style={{ minHeight: '680px', height: 'calc(100vh - 6rem)' }}>
            {isDataLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center min-h-[400px] lg:h-full">
                <Loader size="lg" />
              </div>
            ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden calendar-card lg:h-full flex flex-col">
              <div className="calendar-custom-header flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label={viewMode === 'day' ? 'Previous day' : viewMode === 'year' ? 'Previous year' : 'Previous month'}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 min-w-[140px] sm:min-w-[200px] text-center">
                    {headerLabel}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label={viewMode === 'day' ? 'Next day' : viewMode === 'year' ? 'Next year' : 'Next month'}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setActiveDate(today);
                      setActiveStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
                      setViewMode('day');
                      setCalendarView('month');
                    }}
                    className="h-9 px-3 text-sm rounded-lg rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 transition"
                  >
                    Today
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setViewDropdownOpen((o) => !o)}
                      className="flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 transition"
                    >
                      {VIEW_MODES.find((m) => m.key === viewMode)?.label ?? 'Month'}
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition ${viewDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {viewDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden onClick={() => setViewDropdownOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 z-20 min-w-[100px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          {VIEW_MODES.map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => {
                                handleViewModeChange(m.key);
                                setViewDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${viewMode === m.key ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'}`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                </div>
              </div>

              {viewMode === 'day' ? (
                <div className="day-view-grid">
                  {/* Day date circle header */}
                  <div className="flex items-center border-b border-gray-100 shrink-0 bg-white">
                    <div className="w-16 shrink-0" />
                    <div className="flex-1 flex items-center justify-center gap-2 py-2">
                      <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                        {activeDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full text-[1.1rem] font-semibold ${
                        isToday ? 'bg-primary text-white' : 'text-gray-800'
                      }`}>
                        {activeDate.getDate()}
                      </div>
                    </div>
                  </div>

                  {/* All-day row */}
                  {(allDayEvents.length > 0 || currentDayHoliday) && (
                    <div className="flex border-b border-gray-100 shrink-0 min-h-[44px]">
                      <div className="w-16 shrink-0 flex items-center justify-end pr-3 text-[11px] font-medium text-gray-400">All day</div>
                      <div
                        className="flex-1 flex gap-1.5 flex-wrap px-2 py-2 content-start border-l border-gray-100"
                        style={{ maxHeight: 88, overflowY: 'auto' }}
                      >
                        {currentDayHoliday && (
                          <span className="rounded px-2 py-1 text-xs font-medium text-red-700 bg-red-50 truncate max-w-[200px]">
                            {currentDayHoliday}
                          </span>
                        )}
                        {allDayEvents.map(({ ev }) => (
                          <span
                            key={ev.id}
                            className="rounded px-2 py-1 text-xs font-medium text-white truncate max-w-[200px]"
                            style={{ backgroundColor: ev.color ?? '#2563EB' }}
                          >
                            {ev.fullTitle || ev.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hour grid */}
                  <div ref={hourGridRef} className="hour-scroll">
                    <div style={{ display: 'flex', height: 24 * 56, position: 'relative' }}>
                      {/* Time labels column */}
                      <div style={{ width: 64, flexShrink: 0, position: 'relative' }}>
                        {HOURS.map((h) => h === 0 ? null : (
                          <div
                            key={h}
                            style={{
                              position: 'absolute',
                              top: `${(h / 24) * 100}%`,
                              right: 8,
                              transform: 'translateY(-50%)',
                              fontSize: 11,
                              color: '#9ca3af',
                              whiteSpace: 'nowrap',
                              lineHeight: 1,
                              userSelect: 'none',
                            }}
                          >
                            {h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                          </div>
                        ))}
                      </div>

                      {/* Events + grid lines column */}
                      <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                        {/* Hour lines */}
                        {HOURS.map((h) => (
                          <div key={h} style={{ position: 'absolute', left: 0, right: 0, top: `${(h / 24) * 100}%`, borderTop: '1px solid #e5e7eb' }} />
                        ))}
                        {/* Half-hour lines */}
                        {HOURS.map((h) => (
                          <div key={`hh-${h}`} style={{ position: 'absolute', left: 0, right: 0, top: `${((h + 0.5) / 24) * 100}%`, borderTop: '1px solid #f3f4f6' }} />
                        ))}
                        {/* Now indicator */}
                        {isToday && nowMinutes != null && (
                          <div
                            style={{ position: 'absolute', left: -7, right: 0, top: `${(nowMinutes / (24 * 60)) * 100}%`, display: 'flex', alignItems: 'center', zIndex: 10, pointerEvents: 'none' }}
                          >
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EA4335', flexShrink: 0 }} />
                            <div style={{ flex: 1, height: 2, backgroundColor: '#EA4335' }} />
                          </div>
                        )}
                        {/* Timed events */}
                        {timedEvents.map(({ ev, topPct, heightPct }) => {
                          const startM = getEventMinutes(ev, activeDate);
                          const endM = getEventEndMinutes(ev, activeDate);
                          const fmt = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')} ${m < 720 ? 'AM' : 'PM'}`;
                          const timeLabel = startM != null ? `${fmt(startM)} – ${fmt(endM)}` : '';
                          const bg = ev.color ?? '#2563EB';
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => handleToggleEvent(ev)}
                              style={{
                                position: 'absolute',
                                left: 4,
                                right: 4,
                                top: `${topPct}%`,
                                height: `calc(${heightPct}% - 2px)`,
                                minHeight: 22,
                                backgroundColor: `${bg}20`,
                                borderLeft: `3px solid ${bg}`,
                                borderRadius: 4,
                                overflow: 'hidden',
                                zIndex: 1,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              className="focus:outline-none transition-all hover:brightness-95"
                            >
                              <div style={{ padding: '2px 8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: bg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.3' }}>
                                  {ev.fullTitle || ev.title}
                                </span>
                                {timeLabel && heightPct > 3 && (
                                  <span style={{ fontSize: 10, color: bg, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.3' }}>
                                    {timeLabel}
                                  </span>
                                )}
                                {ev.location && heightPct > 6 && (
                                  <span style={{ fontSize: 10, color: bg, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.3' }}>
                                    📍 {ev.location}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
              <Calendar
                value={viewMode === 'year' ? null : activeDate}
                view={calendarView}
                onViewChange={({ view: nextView }) => nextView && setCalendarView(nextView)}
                onClickMonth={viewMode === 'year' ? handleYearViewMonthClick : undefined}
                onChange={viewMode === 'year' ? undefined : setActiveDate}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate: next }) => {
                  if (!next) return;
                  setActiveStartDate(next);
                  if (viewMode === 'month') {
                    setActiveDate(new Date(next.getFullYear(), next.getMonth(), 1));
                  } else if (viewMode === 'year') {
                    setActiveDate(new Date(next.getFullYear(), 0, 1));
                  }
                }}
                calendarType="gregory"
                formatShortWeekday={(_, date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                prevLabel={null}
                nextLabel={null}
                prev2Label={null}
                next2Label={null}
                tileContent={({ date, view }) => {
                  if (view === 'year') {
                    const monthKey = toMonthKey(date);
                    const eventCount = eventsByMonth[monthKey] || 0;
                    const holidayCount = holidaysByMonth[monthKey] || 0;
                    const total = eventCount + holidayCount;
                    if (total === 0) return null;
                    return (
                      <div className="calendar-tile-inner year-tile">
                        <span className="text-[14px] mb-3 text-gray-600 ">{total} event{total !== 1 ? 's' : ''}</span>
                      </div>
                    );
                  }
                  if (view !== 'month') return null;
                  const key = toDateKey(date);
                  const dayEvents = eventsByDate[key] || [];
                  const isHoliday = holidayDates.has(key);
                  const holidayName = holidayDates.get(key);
                  return (
                    <div className="calendar-tile-inner">
                      {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className="w-full flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium truncate text-left"
                              style={{
                                backgroundColor: `${ev.color ?? '#2563EB'}22`,
                                color: ev.color ?? '#2563EB',
                                borderLeft: `3px solid ${ev.color ?? '#2563EB'}`,
                              }}
                            >
                              <span
                                className="shrink-0 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: ev.color ?? '#2563EB' }}
                              />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] text-gray-500">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                      {isHoliday && dayEvents.every((e) => e.category !== 'holidays') && (
                        <div
                          className="mt-1 rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1"
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            borderLeft: '3px solid #EF4444',
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                          <span className="truncate">{holidayName}</span>
                        </div>
                      )}
                    </div>
                  );
                }}
                tileClassName={({ date, view }) => {
                  if (view === 'year') {
                    return 'rounded-lg';
                  }
                  if (view !== 'month') return '';
                  const key = toDateKey(date);
                  const isHoliday = holidayDates.has(key);
                  const isSelected =
                    date.getDate() === activeDate.getDate() &&
                    date.getMonth() === activeDate.getMonth() &&
                    date.getFullYear() === activeDate.getFullYear();
                  const classes = ['rounded-lg'];
                  if (isSelected) classes.push('!bg-primary/10 !border-2 !border-primary');
                  if (isHoliday) classes.push('text-[#EF4444] font-semibold');
                  return classes.join(' ');
                }}
                className="calendar-widget border-0 w-full lg:flex-1"
              />
              )}
            </div>
            )}
          </div>

          {/* Right: Sidebar - Events & Holidays */}
          <aside className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6" style={{ minHeight: '680px', height: 'calc(100vh - 6rem)' }}>
            {/* Events card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0" style={{ flex: '2 1 0' }}>
              <h3 className="text-xl font-bold text-gray-900 px-4 pt-4 pb-2">Events</h3>
              {currentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center flex-1">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-2xl font-bold text-white mb-2"
                    style={{ backgroundColor: '#9C2EDB' }}
                  >
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-500">No Current Events</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-3 px-4">
                    {activeDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-default px-4 pb-4 pr-2">
                    <ul className="space-y-3">
                    {currentEvents.map((ev) => {
                      let EventIcon = CalendarDays;
                      if (ev.type === 'birthday') {
                        EventIcon = Gift;
                      } else if (ev.type === 'anniversary') {
                        EventIcon = GraduationCap;
                      } else if (ev.icon === 'gift') {
                        EventIcon = Gift;
                      } else if (ev.icon === 'graduation-cap') {
                        EventIcon = GraduationCap;
                      }
                      
                      const id = ev.documentId ?? ev.id;
                      const isExpanded = String(expandedEventId) === String(id);
                      const detail = isExpanded ? (expandedEvent || ev) : null;
                      return (
                        <li key={ev.id}>
                          <button
                            type="button"
                            onClick={() => handleToggleEvent(ev)}
                            className="w-full text-left bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
                          >
                            <div className="flex gap-3 items-start">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-gray-100"
                                style={!ev.event_image ? { backgroundColor: ev.color ?? '#2563EB' } : undefined}
                              >
                                {ev.event_image ? (
                                  <img src={ev.event_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <EventIcon className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-gray-900 text-base leading-tight">
                                  {ev.fullTitle || ev.title}
                                </p>
                                {ev.description ? (
                                  <div className="text-sm text-gray-500 mt-1.5 leading-snug line-clamp-3">
                                    <div className="rich-content">
                                      <div dangerouslySetInnerHTML={{ __html: renderDescription(ev.description || '') }} />
                                    </div>
                                  </div>
                                ) : null}
                                {(ev.time || ev.location) ? (
                                  <div className="mt-2 space-y-0.5 text-sm text-gray-500">
                                    {ev.time ? (
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        <span>{ev.time}</span>
                                      </div>
                                    ) : null}
                                    {ev.location ? (
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        <span>{ev.location}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                              <ChevronDown 
                                className={`w-5 h-5 text-gray-400 transition-transform shrink-0 mt-1 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                            {isExpanded ? (
                              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                                {detailLoading ? (
                                  <div className="flex justify-center py-2">
                                    <Loader />
                                  </div>
                                ) : detail ? (
                                  <div className="space-y-2">
                                    {detail.event_image && detail.type !== 'birthday' && detail.type !== 'anniversary' ? (
                                      <div className="mb-2 rounded-lg overflow-hidden">
                                        <img src={detail.event_image} alt={detail.title} className="w-full h-32 object-cover" />
                                      </div>
                                    ) : null}
                                    {detail.type === 'birthday' && detail.employee ? (
                                      <div>
                                        <p className="text-gray-500">Birthday Celebration</p>
                                        <p className="leading-relaxed">
                                          Join us in celebrating {detail.employee.name}'s special day!
                                        </p>
                                        {detail.employee.location && (
                                          <p className="text-gray-500">Location: {detail.employee.location}</p>
                                        )}
                                        {detail.employee.position && (
                                          <p className="text-gray-500">Position: {detail.employee.position}</p>
                                        )}
                                      </div>
                                    ) : detail.type === 'anniversary' && detail.employee ? (
                                      <div>
                                        <p className="text-gray-500">Work Anniversary</p>
                                        <p className="leading-relaxed">
                                          Congratulations to {detail.employee.name} on {detail.yearsOfService} year{detail.yearsOfService > 1 ? 's' : ''} of service!
                                        </p>
                                        {detail.employee.location && (
                                          <p className="text-gray-500">Location: {detail.employee.location}</p>
                                        )}
                                        {detail.employee.position && (
                                          <p className="text-gray-500">Position: {detail.employee.position}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <div>
                                        {detail.description ? (
                                          <div className="rich-content">
                                            <div dangerouslySetInnerHTML={{ __html: renderDescription(detail.description || '') }} />
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">No details available.</p>
                                )}
                              </div>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  </div>
                </>
              )}
            </div>
            {/* Holidays card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0" style={{ flex: '1 1 0' }}>
              <h3 className="text-xl font-bold text-gray-900 px-4 pt-4 pb-2">Holidays</h3>
              {isDataLoading ? (
                <div className="flex justify-center py-6 px-4 flex-1">
                  <Loader />
                </div>
              ) : currentHolidays.length === 0 ? (
                <p className="text-sm text-gray-500 px-4 pb-4 flex-1">No holidays this month</p>
              ) : (
                <ul className="space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-default px-4 pb-4 pr-2">
                  {currentHolidays.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 text-sm bg-gray-50 p-4 rounded-2xl">
                      <span className="w-6 h-6 rounded flex items-center justify-center bg-[#EF4444] text-white shrink-0">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        {h.title}
                        – {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom legend */}
        <div className="mt-8 flex flex-wrap items-center gap-6 bg-white rounded-xl border border-gray-200 px-6 py-4 shadow-sm">
          {/* Fixed legend entries */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-sm text-gray-700">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#FD8C02' }} />
            <span className="text-sm text-gray-700">Birthday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#9C2EDB' }} />
            <span className="text-sm text-gray-700">Anniversary</span>
          </div>
          {/* Dynamic event-type legend entries */}
          {categoryLegend.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </PageContainer>

      <style jsx global>{`
        .calendar-card .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: white;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .calendar-card .react-calendar__navigation {
          display: none;
        }
        /* Make the view container and month-view fill available flex height */
        .calendar-card .react-calendar__viewContainer,
        .calendar-card .react-calendar__month-view,
        .calendar-card .react-calendar__month-view > div,
        .calendar-card .react-calendar__month-view > div > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .calendar-card .react-calendar__month-view__weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          flex-shrink: 0;
          text-align: center;
          font-size: 0.8125rem;
          color: #6b7280;
          font-weight: normal;
          text-transform: none;
          padding: 0.625rem 0;
          border-bottom: 1px solid #e5e7eb;
          background: #fff;
        }
        .calendar-card .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        /* Days grid stretches to fill remaining height; rows share space equally */
        .calendar-card .react-calendar__month-view__days {
          flex: 1;
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: 1fr;
          gap: 0;
          min-height: 560px;
        }
        .calendar-card .react-calendar__month-view__days__day,
        .calendar-card .react-calendar__tile {
          border: 1px solid #e5e7eb;
          min-width: 0;
          min-height: 0;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 0.875rem;
          font-weight: normal;
          color: #1f2937;
          border-radius: 0;
          background: white;
          box-sizing: border-box;
          overflow: hidden;
        }
        .calendar-card .react-calendar__tile:enabled:hover {
          background-color: #f9fafb;
        }
        .calendar-card .react-calendar__tile--now {
          background: #fef3c7;
        }
        .calendar-card .react-calendar__tile--active {
          background: rgba(156, 46, 219, 0.1);
          border: 2px solid #9C2EDB;
          border-radius: 0.25rem;
        }
        .calendar-tile-inner {
          text-align: left;
          width: 100%;
        }
        .calendar-card .react-calendar__viewContainer,
        .calendar-card .react-calendar__year-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .calendar-card .react-calendar__year-view__months {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(4, 1fr);
          flex: 1;
          min-height: 0;
        }
        .calendar-card .react-calendar__year-view__months__month {
          flex: 1;
          min-height: 0;
          height: 100%;
          min-height: 150px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .calendar-card .react-calendar__year-view .calendar-tile-inner.year-tile {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 0;
        }
        .day-view-grid {
          padding: 0;
          flex: 1 1 0%;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .day-view-grid .hour-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          /* Custom scrollbar */
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .day-view-grid .hour-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .day-view-grid .hour-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .day-view-grid .h-14 {
          height: 3.5rem;
        }
      `}</style>
    </div>
  );
}