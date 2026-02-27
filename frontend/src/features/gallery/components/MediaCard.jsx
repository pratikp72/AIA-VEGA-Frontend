"use client";

import React from 'react';
import { Play } from 'lucide-react';

export default function MediaCard({ item, onClick }) {
  const isVideo = (item.media_type || item.type || '').toLowerCase() === 'video';
  // For images, use thumbnail or medium/large format if available
  // Helper to make absolute URL if needed
  const makeAbsolute = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`;
  };
  let imageUrl = '';
  if (item.image && item.image.formats) {
    imageUrl = makeAbsolute(item.image.formats.thumbnail?.url) || makeAbsolute(item.image.formats.medium?.url) || makeAbsolute(item.image.formats.large?.url) || makeAbsolute(item.image.url);
  } else if (item.image && item.image.url) {
    imageUrl = makeAbsolute(item.image.url);
  } else {
    imageUrl = item.thumbnail;
  }
  // For videos, use the video url
  let videoUrl = '';
  if (item.video && item.video.url) {
    videoUrl = makeAbsolute(item.video.url);
  } else {
    videoUrl = item.url;
  }
  return (
    <div 
      className="relative rounded-[12px] overflow-hidden bg-gray-100 h-[180px] sm:h-[220px] md:h-[257px] cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onClick && onClick(item)}
    >
      <div
        className="w-full h-full bg-center bg-cover"
        style={{ backgroundImage: `url(${isVideo ? '' : imageUrl})` }}
      >
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Play className="w-5 h-5 text-primary-purple" />
            </div>
          </div>
        )}
        {!isVideo && imageUrl && (
          <img
            src={imageUrl}
            alt={item.title || 'Gallery image'}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>
    </div>
  );
}
