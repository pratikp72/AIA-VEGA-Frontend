'use client';

import Link from 'next/link';
import SurfaceCard from '@/components/common/SurfaceCard';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import MarkdownIt from 'markdown-it';

function stripImagesFromPreview(text = '', lineLimit = 3) {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (i >= lineLimit) return line;
    return line
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // markdown images
      .replace(/<img\b[^>]*\/?>/gi, '');        // HTML <img> tags
  }).join('\n');
}

export default function NewsCard({ news }) {
    const md = new MarkdownIt({ html: true, breaks: true });
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  const cov = news.cover_image;
  const url = news.image || (cov && (cov.formats?.thumbnail?.url || cov.formats?.small?.url || cov.url));
  const imageUrl = url ? (url.startsWith('http') ? url : baseUrl + url) : '';
  return (
    <Link href={`/news/${news.documentId ?? news.id}`} className="h-full block">
      <SurfaceCard className="p-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Image - aligned with card, rounded top, no hover effect on image */}
        <div className="relative h-48 overflow-hidden rounded-t-[20px] flex-shrink-0 bg-gray-100">
          {news.imageUrl ? <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" /> : null}
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="inline-flex items-center gap-2 rounded-[4px] bg-[#ECEBFF] text-[#3441A3] h-[15px] p-3">
              {news.category ?? news.news_category?.name ?? 'News'}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col min-h-0">
          {/* Date */}
          <div className="flex items-center gap-2 text-small text-gray-medium mb-2">
            <Calendar className="w-4 h-4" />
            <span>
              {(() => {
                const date = news.publish_date || news.date;
                if (!date) return '';
                const d = new Date(date);
                return d.toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                });
              })()}
            </span>
          </div>

          {/* Title - no line/underline under title */}
          <h3 className="text-h3 text-gray-dark mb-2 line-clamp-2 no-underline">
            {news.title}
          </h3>

          {/* Description - max 3 lines with ellipsis */}
            <div
              className="text-body text-gray-medium mb-2 line-clamp-3 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: md.render(stripImagesFromPreview(news.description || '')) }}
            />

          {/* Read More Link */}
          <div className="text-primary-purple font-medium text-body hover:underline mt-2">
            Read More →
          </div>
        </div>
      </SurfaceCard>
    </Link>
  );
}