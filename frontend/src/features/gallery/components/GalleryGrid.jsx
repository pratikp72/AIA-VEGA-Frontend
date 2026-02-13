"use client";

import React from 'react';
import MediaCard from './MediaCard';

export default function GalleryGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((it) => (
        <div key={it.id} className="w-full">
          <MediaCard item={it} />
        </div>
      ))}
    </div>
  );
}
