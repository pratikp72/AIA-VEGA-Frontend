'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewsCarousel({ news = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, news.length]);

  if (news.length === 0) return null;

  const currentNews = news[currentIndex];

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[360px] w-full">
      {/* Full-bleed background image (blurred) */}
      <img
        src={currentNews.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-[2px] scale-105"
        aria-hidden
      />
      {/* Dark semi-transparent overlay */}
      <div
        className="absolute inset-0 bg-[#1a0a2e]/85"
        aria-hidden
      />

      {/* Content layer */}
      <div className="relative flex flex-col min-h-[360px] pt-8 px-8 pb-8">
        {/* Top bar: tag + date | View All News */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-normal text-white bg-primary">
              {currentNews.category}
            </span>
            <span className="text-white text-body">
              {new Date(currentNews.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <Link
            href="/news"
            className="text-white text-body font-normal underline hover:no-underline whitespace-nowrap"
          >
            View All News
          </Link>
        </div>

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl mb-[30px]">
          {currentNews.title}
        </h2>

        {/* Description */}
        <p className="text-white text-body leading-relaxed max-w-3xl mb-8 pr-24">
          {currentNews.description}
        </p>

        {/* Read More button */}
        <div className="mt-auto">
          <Button
            asChild
            size="default"
            className="rounded-lg bg-primary hover:bg-primary/90 text-white font-bold gap-1.5 h-10 px-5"
          >
            <Link href={`/news/${currentNews.id}`}>
              Read More
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Bottom: pagination dots (center) + arrow buttons (right) */}
        {news.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {news.length > 1 && (
          <div className="absolute right-8 bottom-8 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 bg-white/20 border-white/40 text-white hover:bg-white/30 hover:text-white"
              onClick={() => {
                setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
                setIsAutoPlaying(false);
              }}
              aria-label="Previous news"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 bg-white/20 border-white/40 text-white hover:bg-white/30 hover:text-white"
              onClick={() => {
                setCurrentIndex((prev) => (prev + 1) % news.length);
                setIsAutoPlaying(false);
              }}
              aria-label="Next news"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}