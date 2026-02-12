"use client";

import SurfaceCard from '@/components/common/SurfaceCard';
import { Calendar, User } from 'lucide-react';

export default function PolicyCard({ policy, resource }) {
  const item = policy || resource || {};

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
        {item.tag ? (
          <span className="ml-3 inline-flex items-center bg-primary-purple text-white text-xs font-medium px-3 py-1 rounded-full">{item.tag}</span>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-between gap-4">
        <p className="text-sm text-[#65758B] line-clamp-2 overflow-hidden">{item.description}</p>

        <div className="flex items-center justify-end text-sm">
          <div className="flex items-center gap-2 text-[#65758B]">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(item.date)}</span>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
