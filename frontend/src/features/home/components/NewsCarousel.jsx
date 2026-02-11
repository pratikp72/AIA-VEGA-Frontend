'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="relative bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl overflow-hidden h-[400px]">
      {/* Background Image */}
      <img
        src={currentNews.image}
        alt={currentNews.title}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Content */}
      <div className="relative h-full p-8 flex flex-col justify-between">
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 text-white">
              {currentNews.category}
            </Badge>
            <span className="text-white/80 text-sm">
              {new Date(currentNews.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <a
            href="/news"
            className="text-white hover:underline text-sm font-medium"
          >
            View All News →
          </a>
        </div>

        {/* Bottom Content */}
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            {currentNews.title}
          </h2>
          <p className="text-white/90 text-lg mb-6 line-clamp-2">
            {currentNews.description}
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href={`/news/${currentNews.id}`}>Read More →</Link>
          </Button>
        </div>

        {/* Navigation Arrows */}
        {news.length > 1 && (
          <div className="absolute right-8 bottom-8 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 border-white/40 text-white hover:bg-white/30"
              onClick={() => {
                setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
                setIsAutoPlaying(false);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 border-white/40 text-white hover:bg-white/30"
              onClick={() => {
                setCurrentIndex((prev) => (prev + 1) % news.length);
                setIsAutoPlaying(false);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Dots */}
        {news.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}