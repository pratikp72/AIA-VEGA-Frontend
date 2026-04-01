'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Breadcrumbs({ items = [], showTrailingSeparator = false, className }) {
  if (!items.length) return null;

  return (
    <nav className={cn('breadcrumb gap-2 text-small', className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const labelClass = item.className || (isLast ? 'text-primary-purple font-medium' : 'hover:underline');

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} onClick={item.onClick} className={labelClass}>
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button type="button" onClick={item.onClick} className={labelClass}>
                {item.label}
              </button>
            ) : (
              <span className={labelClass}>{item.label}</span>
            )}
            {(index < items.length - 1 || showTrailingSeparator) && (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        );
      })}
    </nav>
  );
}
