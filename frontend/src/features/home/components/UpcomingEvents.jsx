'use client';

import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

const borderColors = [
  'bg-orange-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-pink-500',
];

export default function UpcomingEvents({ events = [] }) {
  if (events.length === 0) return null;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Event Calendar</h2>
        <Link
          href="/calendar"
          className="text-sm text-primary hover:underline font-medium"
        >
          View Full Calendar →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.slice(0, 4).map((event, index) => (
          <Link key={event.id} href={`/calendar/${event.id}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-gray-200 bg-background min-h-[88px]">
              <div className="flex gap-4 items-stretch">
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center w-12 flex-shrink-0 text-center">
                  <span className="text-xs text-muted-foreground font-medium uppercase">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                    })}
                  </span>
                  <span className="text-2xl font-bold leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                </div>

                {/* Colored vertical divider (internal) */}
                <div className={`w-1 self-stretch rounded ${borderColors[index % borderColors.length]} mx-3`} />

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-2 text-foreground">
                    {event.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {event.description || 'Annual Tech Conference 2024 brings together industry leaders and teams for a day of insights, innovation, and collaboration shaping the future of technology.'}
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
}