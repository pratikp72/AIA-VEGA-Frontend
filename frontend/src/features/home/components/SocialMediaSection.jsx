'use client';

import Link from 'next/link';
import HomeSocialMediaCard from '@/features/home/components/HomeSocialMediaCard';

const MAX_ITEMS = 2;

/** Home: 2 social media cards per row in the home-specific horizontal layout. */
export default function SocialMediaSection({ items = [] }) {
  const visible = items.slice(0, MAX_ITEMS);
  if (visible.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-h2">Social Media</h2>
        <Link
          href="/news/social-media"
          className="text-primary text-body font-medium hover:underline whitespace-nowrap"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((item) => (
          <HomeSocialMediaCard key={String(item.documentId ?? item.id)} item={item} />
        ))}
      </div>
    </section>
  );
}
