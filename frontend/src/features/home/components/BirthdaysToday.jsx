'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function BirthdaysToday({ birthdays = [] }) {
  if (birthdays.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-gray-200 flex flex-col rounded-xl shadow-sm bg-white w-full h-full min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Birthdays Today</h2>
        <Link
          href="/calendar"
          className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium"
        >
          View Calendar →
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {birthdays.slice(0, 4).map((person) => (
          <Card
            key={person.id}
            className="relative flex flex-row items-center gap-3 py-3 px-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow min-h-0"
          >
            {/* Far left: circular profile picture */}
            <div className="flex-shrink-0">
              <img
                src={person.avatar}
                alt={person.name}
                className="w-11 h-11 rounded-full object-cover"
              />
            </div>

            {/* Center-left: name, then date of birthday under name */}
            <div className="flex-1 min-w-0 flex flex-col justify-center pr-20">
              <h3 className="font-semibold text-sm text-gray-900 leading-tight">{person.name}</h3>
              <p className="text-[11px] text-gray-500 leading-tight">
                {new Date(person.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Far right: Today tag */}
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">
              Today
            </span>
          </Card>
        ))}
      </div>
    </Card>
  );
}