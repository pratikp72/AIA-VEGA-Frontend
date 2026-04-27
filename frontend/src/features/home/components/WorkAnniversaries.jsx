'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WorkAnniversaries({ anniversaries = [] }) {
  const validAnniversaries = anniversaries.filter((person) => Number(person?.yearsCompleted) > 0);

  return (
    <section className="w-full h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 text-gray-900">Work Anniversaries</h2>
        <Link
          href="/calendar"
          className="text-body text-primary hover:underline font-medium"
        >
          View Calendar →
        </Link>
      </div>
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-4 self-stretch p-4 flex-1 max-h-[320px]">
        {validAnniversaries.length === 0 ? (
          <div className="text-gray-500 text-center w-full py-6">No anniversary today</div>
        ) : (
          <div
            className={validAnniversaries.length > 2 ? "max-h-[280px] overflow-y-auto w-full pr-2" : "w-full"}
          >
            {validAnniversaries.map((person) => (
              <Link
                key={person.id}
                href={{
                  pathname: '/calendar',
                  query: {
                    type: 'anniversary',
                    personId: String(person.id),
                    personName: person.name || '',
                  },
                }}
                className="block"
              >
                <div className="flex flex-col items-start gap-4 w-full h-[130px] rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center gap-4 py-4 px-5 w-full">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {(person.avatarInitial || person.name?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-h3 text-gray-900 leading-tight font-semibold">{person.name}</h3>
                      <p className="text-small text-gray-500 leading-tight mt-0.5">
                        {person.department} · {new Date(person.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 bg-green-500 text-white text-small font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                      {person.yearsCompleted} year{person.yearsCompleted > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-purple-100 px-4 py-2 flex items-center gap-2 flex-shrink-0 rounded w-full">
                    <Trophy className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-small text-purple-700 font-medium leading-tight">
                      {person.yearsCompleted} Year{person.yearsCompleted > 1 ? 's' : ''} Completion Celebration
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}