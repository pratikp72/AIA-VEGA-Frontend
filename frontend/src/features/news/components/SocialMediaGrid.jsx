'use client';

import SocialMediaCard from './SocialMediaCard';

/** Listing grid: 3 cards per row on desktop. */
export default function SocialMediaGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <SocialMediaCard key={String(item.documentId ?? item.id)} item={item} />
      ))}
    </div>
  );
}
