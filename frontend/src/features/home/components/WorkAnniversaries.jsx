'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WorkAnniversaries({ anniversaries = [] }) {
  if (anniversaries.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-gray-200 flex flex-col rounded-xl shadow-sm bg-white w-full h-full min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Work Anniversaries</h2>
        <Link
          href="/calendar"
          className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium"
        >
          View Calendar →
        </Link>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {anniversaries.slice(0, 3).map((person) => (
          <Card
            key={person.id}
            className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow min-h-0 p-0 gap-0 flex flex-1 flex-col"
          >
            {/* Card content with profile - no bottom padding so banner sits directly below */}
            <div className="relative flex items-center gap-2.5 pt-2 pb-0 px-3 flex-1 min-h-0">
              {/* Profile Picture - circular */}
              <img
                src={person.avatar}
                alt={person.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />

              {/* Info - compact */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 leading-tight">{person.name}</h3>
                <p className="text-[11px] text-gray-500 leading-tight">
                  {person.department} · {new Date(person.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Years Badge - top right, green */}
              <span className="absolute top-1/2 right-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                {person.yearsCompleted} year{person.yearsCompleted > 1 ? 's' : ''}
              </span>
            </div>

            {/* Celebration banner - flush to card bottom */}
            <div className="bg-purple-100 px-3 py-1 flex items-center gap-1.5 rounded-b-xl flex-shrink-0">
              <Trophy className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-[12px] text-purple-700 font-medium leading-tight">
                {person.yearsCompleted} Year{person.yearsCompleted > 1 ? 's' : ''} Completion Celebration
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}