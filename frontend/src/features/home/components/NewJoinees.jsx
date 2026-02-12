'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function NewJoinees({ joinees = [] }) {
  if (joinees.length === 0) {
    return null;
  }

  return (
    <section className="h-[681px] flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">New Joinees</h2>
        <Link
          href="/people"
          className="text-body text-primary hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="flex flex-col items-start gap-6 flex-1 min-h-0 w-full overflow-y-auto scrollbar-hide">
        {joinees.map((person) => (
          <Link key={person.id} href={`/people/${person.id}`} className="w-full min-w-0">
            <Card className="w-full min-w-0 p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white rounded-[20px] h-[140px] flex flex-col min-h-0 overflow-visible justify-center items-start gap-4 self-stretch">
              <div className="flex items-center gap-4 flex-1 min-h-0 min-w-0 w-full">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-20 h-20 rounded object-cover"
                  />
                  <span className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-small px-1 py-1 rounded whitespace-nowrap text-white">
                    New Joinee
                  </span>
                </div>
              </div>

              {/* Person Info */}
              <div className="flex flex-col items-start gap-2 flex-[1_0_0] min-w-0 ">
                <h3 className="text-h3">{person.name}</h3>
                <p className="text-small text-muted-foreground mb-2">
                  {person.position}
                </p>

                {/* Phone */}
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-small text-muted-foreground truncate">
                    {person.phone}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-small text-muted-foreground truncate">
                    {person.email}
                  </span>
                </div>
              </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}