'use client';

import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays, Clock, MapPin, Gift, GraduationCap, Info } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import {
  MOCK_CALENDAR_EVENTS,
  MOCK_CALENDAR_HOLIDAYS,
} from '@/services/mockData';
import 'react-calendar/dist/Calendar.css';

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

export default function CalendarPage() {
  const [activeDate, setActiveDate] = useState(new Date(2024, 0, 3)); // Jan 3, 2024 (selected in image)
  const [activeStartDate, setActiveStartDate] = useState(new Date(2024, 0, 1)); // displayed month
  const eventsByDate = useMemo(() => {
    const map = {};
    MOCK_CALENDAR_EVENTS.forEach((ev) => {
      const key = ev.date;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, []);

  const holidayDates = useMemo(
    () => new Set(MOCK_CALENDAR_HOLIDAYS.map((h) => h.date)),
    []
  );

  const currentEvents = useMemo(() => {
    const key = toDateKey(activeDate);
    return eventsByDate[key] || [];
  }, [activeDate, eventsByDate]);

  const currentHolidays = useMemo(() => {
    return MOCK_CALENDAR_HOLIDAYS.filter((h) => {
      const d = new Date(h.date);
      const ay = d.getFullYear();
      const am = d.getMonth();
      const ad = activeDate.getFullYear();
      const bm = activeDate.getMonth();
      return ay === ad && am === bm;
    });
  }, [activeDate]);

  const monthYearLabel = activeStartDate
    ? activeStartDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'January 2024';

  const goPrevMonth = () => {
    setActiveStartDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setActiveStartDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
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
          {/* Left: Calendar - match second image exactly */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden calendar-card">
              <div className="calendar-custom-header flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={goPrevMonth}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 min-w-[120px] text-center">
                    {monthYearLabel}
                  </span>
                  <button
                    type="button"
                    onClick={goNextMonth}
                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 transition"
                >
                  Month
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <Calendar
                value={activeDate}
                onChange={setActiveDate}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate: next }) => next && setActiveStartDate(next)}
                calendarType="gregory"
                formatShortWeekday={(_, date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                prevLabel={null}
                nextLabel={null}
                prev2Label={null}
                next2Label={null}
                tileContent={({ date, view }) => {
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
                              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium truncate"
                              style={{
                                backgroundColor: `${ev.color}22`,
                                color: ev.color,
                                borderLeft: `3px solid ${ev.color}`,
                              }}
                            >
                              <span
                                className="shrink-0 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: ev.color }}
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
            </div>
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
                      return (
                        <li
                          key={ev.id}
                          className="bg-gray-50 rounded-xl p-4 flex gap-3"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: ev.color }}
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
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Holidays</h3>
              {currentHolidays.length === 0 ? (
                <p className="text-sm text-gray-500">No holidays this month</p>
              ) : (
                <ul className="space-y-2">
                  {currentHolidays.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 text-sm bg-gray-50 p-4 rounded-2xl">
                      <span className="w-6 h-6 rounded flex items-center justify-center bg-[#EF4444] text-white shrink-0">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        {h.title} – {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
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
      `}</style>
    </div>
  );
}
