"use client";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../calendar.css';

import PageHeader from '@/components/common/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import SurfaceCard from '@/components/common/SurfaceCard';
import PageSection from '@/components/common/PageSection';
import { loadCalendarEvents } from '../calendarSlice';
import { selectCalendarEvents, selectCalendarLoading } from '../calendarSelectors';

export default function CalendarPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const events = useSelector(selectCalendarEvents) || [];
  const loading = useSelector(selectCalendarLoading);

  useEffect(() => {
    try {
      const p = dispatch(loadCalendarEvents());
      if (p && typeof p.then === 'function') p.catch((err) => console.error('loadCalendarEvents failed:', err));
    } catch (err) {
      console.error('dispatch(loadCalendarEvents) threw:', err);
    }
  }, [dispatch]);

  const handleEventClick = (info) => {
    try {
      const props = info.event.extendedProps || {};
      if (props.url) {
        // external PDF or link
        window.open(props.url, '_blank');
        return;
      }
      const resourceId = props.resourceId || props.id;
      if (resourceId) {
        router.push(`/resources/${resourceId}`);
      }
    } catch (err) {
      console.error('event click handler error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Calendar" breadcrumbs={[{ label: 'Calendar' }]} containerClassName="pt-xl pb-0 px-xl">
        <p className="text-body text-muted-foreground">Stay on top of events, deadlines, and celebrations</p>
      </PageHeader>

      <PageSection>
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <SurfaceCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Calendar</h3>
                {loading ? (
                  <div>Loading events...</div>
                ) : (
                  <>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      headerToolbar={{ left: 'prev,next', center: 'title', right: 'dayGridMonth' }}
                      buttonText={{ month: 'Month' }}
                      navLinks={true}
                      dayMaxEventRows={3}
                      expandRows={true}
                      height={'auto'}
                      contentHeight={700}
                      events={events.map((e) => {
                        // map semantic types to palette
                        const colorMap = {
                          Policy: '#2563EB', // blue
                          Form: '#fb923c', // orange
                          Holidays: '#ef4444', // red
                          Holiday: '#ef4444',
                          Conference: '#2563EB',
                          Training: '#10B981', // green
                          default: '#7c3aed',
                        };
                        const bg = colorMap[e.type] || colorMap.default;
                        return {
                          ...e,
                          backgroundColor: bg,
                          borderColor: bg,
                          textColor: '#ffffff',
                        };
                      })}
                      eventContent={(arg) => {
                        return (
                          <div className="fc-event-custom">
                            <span className="fc-event-icon">📅</span>
                            <span className="fc-event-title">{arg.event.title}</span>
                          </div>
                        );
                      }}
                      eventClick={handleEventClick}
                    />

                    <div className="mt-6">
                      <div className="legend flex items-center gap-4 flex-wrap">
                        {[
                          ['#2563EB', 'Conferences'],
                          ['#fb923c', 'Birthdays'],
                          ['#a78bfa', 'Work Anniversaries'],
                          ['#10B981', 'Training Sessions'],
                          ['#f59e0b', 'Lorem ipsum'],
                          ['#3b82f6', 'Lorem ipsum'],
                          ['#ef4444', 'Holidays'],
                        ].map(([c, label], i) => (
                          <div key={`${label}-${i}`} className="legend-item flex items-center gap-2">
                            <span className="legend-dot" style={{ background: c }} />
                            <span className="text-sm text-[#374151]">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </SurfaceCard>
            </div>

            <aside className="lg:col-span-4">
              <SurfaceCard className="p-4">
                <h4 className="font-semibold">Events</h4>
                <div className="mt-3 text-sm text-[#65758B]">A quick list of upcoming items.</div>
              </SurfaceCard>
            </aside>
          </div>
        </PageContainer>
      </PageSection>
    </div>
  );
}
