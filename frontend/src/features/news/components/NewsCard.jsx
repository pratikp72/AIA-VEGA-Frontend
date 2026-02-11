'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function NewsCard({ news }) {
  return (
    <Link href={`/news/${news.id}`} className="h-full block">
      <Card className="p-0 gap-0 overflow-hidden rounded-xl border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Image - aligned with card, rounded top, no hover effect on image */}
        <div className="relative h-48 overflow-hidden rounded-t-xl flex-shrink-0">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary-purple text-white">
              {news.category}
            </Badge>
          </div>
        </div>

        {/* Content - flex so description fills space and all cards same height */}
        <div className="px-6 pt-2.5 pb-3 flex-1 flex flex-col min-h-0">
          {/* Date */}
          <div className="flex items-center gap-2 text-small text-gray-medium mb-3">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(news.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Title - no line/underline under title */}
          <h3 className="text-h3 text-gray-dark mb-2 line-clamp-2 no-underline">
            {news.title}
          </h3>

          {/* Description - grows to fill so card height stays consistent */}
          <p className="text-body text-gray-medium mb-3 line-clamp-3 flex-1 min-h-0">
            {news.description}
          </p>

          {/* Read More Link */}
          <div className="text-primary-purple font-medium text-body hover:underline mt-auto">
            Read More →
          </div>
        </div>
      </Card>
    </Link>
  );
}