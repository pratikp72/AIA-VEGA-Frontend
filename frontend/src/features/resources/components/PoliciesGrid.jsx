"use client";

import Link from 'next/link';
import PolicyCard from './PolicyCard';

export default function PoliciesGrid({ resources }) {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {resources.map((r) => (
        <Link key={r.id} href={`/resources/${r.id}`} className="block">
          <PolicyCard resource={r} />
        </Link>
      ))}
    </div>
  );
}
