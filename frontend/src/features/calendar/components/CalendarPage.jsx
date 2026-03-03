'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays, Clock, MapPin, Gift, GraduationCap, Info } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import { fetchEvents, fetchEventById, fetchHolidays } from '@/features/calendar/calendarAPI';
import Loader from '@/components/common/Loader';
import 'react-calendar/dist/Calendar.css';

const VIEW_MODES = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const CATEGORY_LEGEND = [
  { key: 'conferences', label: 'Conferences', color: '#2563EB' },
  { key: 'birthdays', label: 'Birthdays', color: '#FD8C02' },
  { key: 'work_anniversaries', label: 'Work Anniversaries', color: '#9C2EDB' },
  { key: 'training', label: 'Training Sessions', color: '#00F078' },
  { key: 'loreum', label: 'Loreum ipsum', color: '#F0C51A' },
  { key: 'loreum_blue', label: 'Loreum ipsum', color: '#2563EB' },
  { key: 'holidays', label: 'Holidays', color: '#EF4444' },
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
  const [viewMode, setViewMode] = useState('month');
  const [activeDate, setActiveDate] = useState(() => new Date());
  const [activeStartDate, setActiveStartDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [eventsList, setEventsList] = useState([]);
  const [holidaysList, setHolidaysList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

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
    setExpandedEventId(null);
    setExpandedEvent(null);
    setDetailLoading(false);
  }, [activeDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    (eventsList || []).forEach((ev) => {
      const key = ev.date;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [eventsList]);

  const holidayDates = useMemo(
    () => new Set((holidaysList || []).map((h) => h.date).filter(Boolean)),
    [holidaysList]
  );

  const eventsByMonth = useMemo(() => {
    const map = {};
    (eventsList || []).forEach((ev) => {
      if (!ev.date) return;
      const monthKey = ev.date.slice(0, 7);
      map[monthKey] = (map[monthKey] || 0) + 1;
    });
    return map;
  }, [eventsList]);

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

  const isToday = useMemo(() => {
    const t = new Date();
    return activeDate.getDate() === t.getDate() && activeDate.getMonth() === t.getMonth() && activeDate.getFullYear() === t.getFullYear();
  }, [activeDate]);

  const nowMinutes = useMemo(() => {
    if (!isToday) return null;
    const t = new Date();
    return t.getHours() * 60 + t.getMinutes();
  }, [isToday]);

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
      setActiveStartDate((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1));
    } else {
      setActiveStartDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    }
  };
  const goNext = () => {
    if (viewMode === 'day') {
      setActiveDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
    } else if (viewMode === 'year') {
      setActiveStartDate((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1));
    } else {
      setActiveStartDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
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
    fetchEventById(id)
      .then((data) => setExpandedEvent(data))
      .catch(() => setExpandedEvent(null))
      .finally(() => setDetailLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8]">
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Calendar */}
          <div className="flex-1 min-w-0">
            {eventsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center min-h-[400px]">
                <Loader size="lg" />
              </div>
            ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden calendar-card">
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

              {viewMode === 'day' ? (
                <div className="day-view-grid flex flex-col min-h-[500px]">
                  {/* All-day row */}
                  {(allDayEvents.length > 0) && (
                    <div className="flex border-b border-gray-200 min-h-[44px] shrink-0">
                      <div className="w-14 shrink-0 py-2 pr-2 text-right text-xs text-gray-500 border-r border-gray-200 font-medium">All day</div>
                      <div className="flex-1 flex gap-1.5 flex-wrap p-2 content-start">
                        {allDayEvents.map(({ ev }) => (
                          <div
                            key={ev.id}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium truncate max-w-[220px] border-l-2"
                            style={{ backgroundColor: `${ev.color ?? '#2563EB'}22`, color: ev.color ?? '#2563EB', borderLeftColor: ev.color ?? '#2563EB' }}
                          >
                            {ev.fullTitle || ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Hour grid - scrollable */}
                  <div className="flex flex-1 min-h-0 overflow-auto">
                    <div className="w-14 shrink-0 flex flex-col border-r border-gray-200 bg-gray-50/50">
                      {HOURS.map((h) => (
                        <div key={h} className="h-14 flex items-start justify-end pr-2 text-xs text-gray-500 leading-none pt-0.5">
                          {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 relative bg-white" style={{ height: 24 * 56, minHeight: 400 }}>
                      {/* Hour lines */}
                      {HOURS.map((h) => (
                        <div key={h} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${(h / 24) * 100}%`, height: '4.166%' }} />
                      ))}
                      {/* Now line (today only) */}
                      {isToday && nowMinutes != null && (
                        <div
                          className="absolute left-0 right-0 z-10 flex items-center"
                          style={{ top: `${(nowMinutes / (24 * 60)) * 100}%` }}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 h-0.5 bg-primary" />
                        </div>
                      )}
                      {/* Timed event blocks */}
                      {timedEvents.map(({ ev, topPct, heightPct }) => {
                        const EventIcon = ev.icon === 'gift' ? Gift : ev.icon === 'graduation-cap' ? GraduationCap : CalendarDays;
                        const startM = getEventMinutes(ev, activeDate);
                        const endM = getEventEndMinutes(ev, activeDate);
                        const timeLabel = startM != null ? `${String(Math.floor(startM / 60) % 12 || 12)}:${String(startM % 60).padStart(2, '0')} ${startM < 720 ? 'AM' : 'PM'} – ${String(Math.floor(endM / 60) % 12 || 12)}:${String(endM % 60).padStart(2, '0')} ${endM < 720 ? 'AM' : 'PM'}` : '';
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => handleToggleEvent(ev)}
                            className="absolute left-1 right-1 rounded-md text-left overflow-hidden border-l-2 shadow-sm hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary z-[1]"
                            style={{
                              top: `${topPct}%`,
                              height: `calc(${heightPct}% - 2px)`,
                              minHeight: 20,
                              backgroundColor: `${ev.color ?? '#2563EB'}18`,
                              borderLeftColor: ev.color ?? '#2563EB',
                              color: ev.color ?? '#2563EB',
                            }}
                          >
                            <div className="px-2 py-0.5 flex items-center gap-1.5">
                              <EventIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              <span className="font-semibold text-xs truncate text-gray-900">{ev.fullTitle || ev.title}</span>
                            </div>
                            {timeLabel && (
                              <div className="px-2 text-[10px] text-gray-500 truncate">{timeLabel}</div>
                            )}
                            {ev.location && heightPct > 6 && (
                              <div className="px-2 flex items-center gap-1 text-[10px] text-gray-500 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{ev.location}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
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
                onActiveStartDateChange={({ activeStartDate: next }) => next && setActiveStartDate(next)}
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
                        <span className="text-[10px] font-medium text-gray-600">{total} event{total !== 1 ? 's' : ''}</span>
                      </div>
                    );
                  }
                  if (view !== 'month') return null;
                  const key = toDateKey(date);
                  const dayEvents = eventsByDate[key] || [];
                  const isHoliday = holidayDates.has(key);
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
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          Holiday
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
                  const classes = ['rounded-lg h-[120px]'];
                  if (isSelected) classes.push('!bg-primary/10 !border-2 !border-primary');
                  if (isHoliday) classes.push('text-[#EF4444] font-semibold');
                  return classes.join(' ');
                }}
                className="calendar-widget border-0 w-full"
              />
              )}
            </div>
            )}
          </div>

          {/* Right: Sidebar - Events & Holidays */}
          <aside className="w-full lg:w-[360px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
              {currentEvents.length === 0 ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 p-4 pb-0">Events</h3>
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-2xl font-bold text-white mb-2"
                      style={{ backgroundColor: '#9C2EDB' }}
                    >
                      <Info className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-500">No Current Events</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4">
                  <p className="text-xl font-bold text-gray-900 mb-4">
                    {activeDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                  <ul className="space-y-3">
                    {currentEvents.map((ev) => {
                      const EventIcon = ev.icon === 'gift' ? Gift : ev.icon === 'graduation-cap' ? GraduationCap : CalendarDays;
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
                            <div className="flex gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                                style={{ backgroundColor: ev.color ?? '#2563EB' }}
                              >
                                <EventIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-gray-900 text-base leading-tight">
                                  {ev.fullTitle || ev.title}
                                </p>
                                {ev.description ? (
                                  <p className="text-sm text-gray-500 mt-1.5 leading-snug line-clamp-3">
                                    {ev.description}
                                  </p>
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
                            </div>
                            {isExpanded ? (
                              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                                {detailLoading ? (
                                  <div className="flex justify-center py-2">
                                    <Loader />
                                  </div>
                                ) : detail ? (
                                  <div className="space-y-2">
                                    {detail.event_type ? (
                                      <p className="text-gray-500">{detail.event_type}</p>
                                    ) : null}
                                    {detail.description ? (
                                      <p className="leading-relaxed">{detail.description}</p>
                                    ) : null}
                                    {(detail.start_date || detail.end_date) ? (
                                      <p className="text-gray-500">
                                        {detail.start_date ? new Date(detail.start_date).toLocaleString() : ''}{detail.end_date ? ` → ${new Date(detail.end_date).toLocaleString()}` : ''}
                                      </p>
                                    ) : null}
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
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Holidays</h3>
              {holidaysLoading ? (
                <div className="flex justify-center py-6">
                  <Loader />
                </div>
              ) : currentHolidays.length === 0 ? (
                <p className="text-sm text-gray-500">No holidays this month</p>
              ) : (
                <ul className="space-y-2">
                  {currentHolidays.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 text-sm bg-gray-50 p-4 rounded-2xl">
                      <span className="w-6 h-6 rounded flex items-center justify-center bg-[#EF4444] text-white shrink-0">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        {h.title}
                        {h.holiday_for ? ` (${h.holiday_for})` : ''} – {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
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
          {CATEGORY_LEGEND.map((item) => (
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
        }
        .calendar-card .react-calendar__navigation {
          display: none;
        }
        .calendar-card .react-calendar__month-view__weekdays,
        .calendar-card .react-calendar__month-view__days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .calendar-card .react-calendar__month-view__weekdays {
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
        .calendar-card .react-calendar__month-view__days {
          gap: 0;
        }
        .calendar-card .react-calendar__month-view__days__day,
        .calendar-card .react-calendar__tile {
          border: 1px solid #e5e7eb;
          min-width: 0;
          min-height: 100px;
          padding: 8px 8px 63px 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 0.875rem;
          font-weight: normal;
          color: #1f2937;
          border-radius: 0;
          background: white;
          box-sizing: border-box;
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
        .calendar-card .react-calendar__year-view__months__month {
          min-height: 60px;
          padding: 8px;
        }
        .calendar-card .react-calendar__year-view .calendar-tile-inner.year-tile {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 0;
        }
        .day-view-grid {
          padding: 0;
        }
        .day-view-grid .h-14 {
          height: 3.5rem;
        }
      `}</style>
    </div>
  );
}