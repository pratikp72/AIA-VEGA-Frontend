"use client";

import React from 'react';
import { Play } from 'lucide-react';

export default function MediaCard({ item, onClick }) {
  const isVideo = (item.type || '').toLowerCase() === 'video';
  return (
    <div 
      className="relative rounded-[12px] overflow-hidden bg-gray-100 h-[180px] sm:h-[220px] md:h-[257px] cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onClick && onClick(item)}
    >
      <div
        className="w-full h-full bg-center bg-cover"
        style={{ backgroundImage: `url(${item.thumbnail})` }}
      />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow">
            <Play className="w-5 h-5 text-primary-purple" />
          </div>
        </div>
      )}
    </div>
  );
}
