"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play } from 'lucide-react';

const VIDEO_FALLBACK_POSTER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFmMjkzNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBiMTIyMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMjI1IiByPSI0OCIgcng9IjQ4IiBmaWxsPSIjZmZmZmZmYzAiLz48cG9seWdvbiBwb2ludHM9IjM4NiwxOTYgMzg2LDI1NCA0MzgsMjI1IiBmaWxsPSIjMzM0MTU1Ii8+PC9zdmc+';
const BASE_MEDIA_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');
const VIDEO_THUMBNAIL_CACHE = new Map();

function toAbsoluteUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_MEDIA_URL}${url}`;
}

export default function MediaCard({ item, onClick }) {
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);

  const isVideo = (item.media_type || item.type || '').toLowerCase() === 'video';
  const videoUrl = useMemo(() => toAbsoluteUrl(item.video?.url || item.url), [item.video?.url, item.url]);
  const imageUrl = useMemo(() => {
    if (item.image?.formats) {
      return (
        toAbsoluteUrl(item.image.formats.thumbnail?.url) ||
        toAbsoluteUrl(item.image.formats.medium?.url) ||
        toAbsoluteUrl(item.image.formats.large?.url) ||
        toAbsoluteUrl(item.image.url)
      );
    }
    if (item.image?.url) return toAbsoluteUrl(item.image.url);
    return item.thumbnail || '';
  }, [item.image, item.thumbnail]);

  // Delay expensive first-frame extraction until the card is near viewport.
  useEffect(() => {
    if (!isVideo) {
      setIsInView(false);
      return;
    }

    const element = cardRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '220px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVideo, videoUrl]);

  useEffect(() => {
    if (!isVideo) return;

    if (!videoUrl) {
      setVideoThumbnail(VIDEO_FALLBACK_POSTER);
      return;
    }

    const cached = VIDEO_THUMBNAIL_CACHE.get(videoUrl);
    if (cached) {
      setVideoThumbnail(cached);
      return;
    }

    if (!isInView) {
      setVideoThumbnail(null);
      return;
    }

    const video = document.createElement('video');
    let timeoutId;

    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;
    video.style.display = 'none';
    document.body.appendChild(video);

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleVideoError);
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
    };

    const handleSeeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 800;
        canvas.height = video.videoHeight || 450;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const frameUrl = canvas.toDataURL('image/jpeg', 0.7);
          VIDEO_THUMBNAIL_CACHE.set(videoUrl, frameUrl);
          setVideoThumbnail(frameUrl);
        } else {
          VIDEO_THUMBNAIL_CACHE.set(videoUrl, VIDEO_FALLBACK_POSTER);
          setVideoThumbnail(VIDEO_FALLBACK_POSTER);
        }
      } finally {
        cleanup();
      }
    };

    const handleLoadedData = () => {
      try {
        const seekTime = video.duration && Number.isFinite(video.duration)
          ? Math.min(0.1, Math.max(0, video.duration - 0.05))
          : 0;
        video.currentTime = seekTime;
      } catch {
        handleSeeked();
      }
    };

    const handleVideoError = () => {
      VIDEO_THUMBNAIL_CACHE.set(videoUrl, VIDEO_FALLBACK_POSTER);
      setVideoThumbnail(VIDEO_FALLBACK_POSTER);
      cleanup();
    };

    timeoutId = setTimeout(() => {
      VIDEO_THUMBNAIL_CACHE.set(videoUrl, VIDEO_FALLBACK_POSTER);
      setVideoThumbnail(VIDEO_FALLBACK_POSTER);
      cleanup();
    }, 5000);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleVideoError);
    video.load();
    
    return () => {
      cleanup();
    };
  }, [isVideo, videoUrl, isInView]);
  
  const backgroundImageUrl = isVideo
    ? (videoThumbnail || item.thumbnail || VIDEO_FALLBACK_POSTER)
    : (imageUrl || item.thumbnail);
  
  return (
    <div 
      ref={cardRef}
      className="relative rounded-[12px] overflow-hidden bg-gray-100 h-[180px] sm:h-[220px] md:h-[257px] cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => onClick && onClick(item)}
    >
      <div
        className="w-full h-full bg-center bg-cover"
        style={{ backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none' }}
      >
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Play className="fill-purple-500 stroke-none"  />
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
