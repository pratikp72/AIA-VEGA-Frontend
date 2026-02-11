'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function NewJoinees({ joinees = [] }) {
  if (joinees.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">New Joinees</h2>
        <Link
          href="/people"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-auto">
        {joinees.slice(0, 4).map((person) => (
          <Link key={person.id} href={`/people/${person.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 bg-background min-h-[88px] rounded-xl shadow-sm">
              <div className="flex gap-4">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <span className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap text-white">
                    New Joinee
                  </span>
                </div>
              </div>

              {/* Person Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{person.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {person.position}
                </p>

                {/* Phone */}
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {person.phone}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {person.email}
                  </span>
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