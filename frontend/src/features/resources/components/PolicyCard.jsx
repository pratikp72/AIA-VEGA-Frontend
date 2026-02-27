"use client";

import { useMemo } from 'react';
import SurfaceCard from '@/components/common/SurfaceCard';
import { Calendar } from 'lucide-react';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

export default function PolicyCard({ policy, resource }) {
  const item = policy || resource || {};

const renderDescription = (description) => {
  if (!description) return '';
  
  // Strip HTML tags first, then render markdown
  const stripped = description.replace(/<[^>]*>/g, '');
  return md.render(stripped);
};

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  return (
    <SurfaceCard
      role="button"
      tabIndex={0}
      className="w-full cursor-pointer p-4 h-full flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-xl font-bold leading-tight truncate">{item.title}</h4>
        {Array.isArray(item.tags) && item.tags.length > 0 ? (
          <span className="ml-3 inline-flex items-center bg-primary-purple text-white text-xs font-medium px-3 py-1 rounded-full">
            {item.tags.join(', ')}
          </span>
        ) : item.tags && typeof item.tags === 'string' ? (
          <span className="ml-3 inline-flex items-center bg-primary-purple text-white text-xs font-medium px-3 py-1 rounded-full">{item.tags}</span>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-between gap-4">
        <div
  className="text-sm text-[#65758B] line-clamp-2 overflow-hidden"
  dangerouslySetInnerHTML={{ __html: renderDescription(item.description) }}
/>

        <div className="flex items-center justify-end text-sm">
          <div className="flex items-center gap-2 text-[#65758B]">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(item.createdAt || item.publishedAt)}</span>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
