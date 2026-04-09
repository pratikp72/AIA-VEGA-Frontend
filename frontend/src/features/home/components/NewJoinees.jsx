'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';


export default function NewJoinees({ joinees = [], showAll = false }) {
  if (joinees.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">
          New Joinees
          {joinees.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">({joinees.length})</span>
          )}
        </h2>
        {!showAll && (
          <Link
            href="/people"
            className="text-body text-primary hover:underline font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="flex flex-col items-start gap-6 w-full overflow-y-auto scrollbar-hide" style={{ maxHeight: '632px' }}>
        {joinees.map((person) => (
          <Link
            key={person.id}
            href={{
              pathname: '/people',
              query: {
                search: person.name || '',
                company: person.company || '',
              },
            }}
            className="block w-full min-w-0"
          >
            <Card className="w-full min-w-0 p-4 border border-gray-200 bg-white rounded-4xl h-35 flex flex-col min-h-0 overflow-visible justify-center items-start gap-4 self-stretch hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 flex-1 min-h-0 min-w-0 w-full">
                <div className="shrink-0">
                  <div className="relative">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-20 h-20 rounded object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded bg-primary text-white flex items-center justify-center text-h2 font-semibold">
                        {(person.avatarInitial || person.name?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <span className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-small px-1 py-1 rounded whitespace-nowrap">
                      New Joinee
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 flex-[1_0_0] min-w-0 ">
                  <h3 className="text-h3">{person.name}</h3>
                  <p className="text-small text-muted-foreground mb-2">
                    {person.position}
                  </p>

                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-small text-muted-foreground truncate">
                      {person.phone}
                    </span>
                  </div>

                  {typeof person.email === 'string' &&
                    !person.email.trim().toLowerCase().endsWith('@aia.internal') && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-small text-muted-foreground truncate">
                          {person.email}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}