"use client";

import Link from 'next/link';
import PolicyCard from './PolicyCard';

export default function PoliciesGrid({ resources }) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 items-stretch">
      {resources.map((r) => (
        <Link key={r.id} href={`/resources/${r.documentId}`} className="block">
          <PolicyCard resource={r} />
        </Link>
      ))}
    </div>
  );
}
