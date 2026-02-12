'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function BirthdaysToday({ birthdays = [] }) {
  if (birthdays.length === 0) {
    return null;
  }

  return (
    <section className="w-full h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 text-gray-900">Birthdays Today</h2>
        <Link
          href="/calendar"
          className="text-body text-purple-600 hover:text-purple-700 hover:underline font-medium"
        >
          View Calendar →
        </Link>
      </div>

      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-4 self-stretch p-4">
        {birthdays.slice(0, 4).map((person) => (
          <div
            key={person.id}
            className="relative flex flex-row items-center gap-2 h-[59px] w-full"
          >
            <div className="flex-shrink-0">
              <img
                src={person.avatar}
                alt={person.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center pr-24">
              <h3 className="text-h3 text-gray-900 leading-tight font-semibold">{person.name}</h3>
              <p className="text-small text-gray-500 leading-tight mt-0.5">
                {new Date(person.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 bg-green-500 text-white text-small font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
              Today
            </span>
          </div>
        ))}
      </Card>
    </section>
  );
}