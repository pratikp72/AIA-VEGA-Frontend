'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showSummary = false,
  totalCount,
  perPageLabel,
  onPerPageClick,
  perPageOptions,
  perPage,
  onPerPageChange,
  className,
}) {
  const normalizeOption = (opt) => {
    if (opt && typeof opt === 'object' && Object.prototype.hasOwnProperty.call(opt, 'value')) {
      return {
        value: opt.value,
        label: opt.label ?? String(opt.value),
      };
    }
    return {
      value: opt,
      label: typeof opt === 'number' ? `${opt} per page` : String(opt),
    };
  };

  const goPrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // default per-page options (multiples of 3)
  const defaultPerPageOptions = (Array.isArray(perPageOptions)
    ? perPageOptions
    : [3, 6, 9, 12, 15]).map(normalizeOption);

  // Sliding window of 3 pages ending at currentPage (clamped).
  // Prefixes [1] … when window doesn't start at 1.
  // Suffixes … [N] when window doesn't end at N.
  const getPageItems = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const rawEnd = Math.min(totalPages, Math.max(3, currentPage));
    const windowEnd = rawEnd === totalPages - 1 ? totalPages : rawEnd;
    const windowStart = Math.max(1, windowEnd - 2);

    const items = [];

    // Leading: [1] + ellipsis if gap > 1, just [1] if adjacent
    if (windowStart > 2) {
      items.push(1, null);
    } else if (windowStart === 2) {
      items.push(1);
    }

    for (let p = windowStart; p <= windowEnd; p++) items.push(p);

    // Trailing: ellipsis + [N] if gap > 1, just [N] if adjacent
    if (windowEnd < totalPages - 1) {
      items.push(null, totalPages);
    } else if (windowEnd === totalPages - 1) {
      items.push(totalPages);
    }

    return items;
  };

  const pageItems = getPageItems();

  return (
    <div className={cn('w-full', className)}>
      {showSummary ? (
        <div className="flex items-center justify-between gap-4">
          {/* Left: total count */}
          <div className="text-sm" style={{ color: 'var(--color-primary)' }}>Total: {totalCount ?? 0}</div>

          {/* Center: pager with arrows + up to 3 squared page buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              disabled={currentPage === 1}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </Button>

            {pageItems.map((page, idx) =>
              page === null ? (
                <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 select-none">
                  &hellip;
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md',
                    currentPage === page
                      ? 'bg-primary-purple text-white'
                      : 'border border-gray-200 bg-white text-gray-700'
                  )}
                  aria-current={currentPage === page ? 'true' : undefined}
                >
                  {page}
                </button>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </Button>
          </div>

          {/* Right: per-page dropdown styled as purple pill */}
          <div className="relative inline-flex">
            <select
              value={String(perPage)}
              onChange={(e) => {
                const selected = defaultPerPageOptions.find((opt) => String(opt.value) === e.target.value);
                onPerPageChange?.(selected ? selected.value : e.target.value);
              }}
              className="appearance-none rounded-full px-4 py-1 text-sm pr-7"
              aria-label="Items per page"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none' }}
            >
              {defaultPerPageOptions.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)} className="text-black">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
      ) : (
        <div className={cn('flex flex-col gap-4', className)}>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full border-gray-200 hover:shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {pageItems.map((page, idx) =>
              page === null ? (
                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400 select-none">
                  &hellip;
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => onPageChange(page)}
                  className={
                    currentPage === page
                      ? 'rounded-full bg-primary-purple hover:bg-primary-purple/90 border-gray-200'
                      : 'rounded-full border-gray-200 hover:shadow-md'
                  }
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full border-gray-200 hover:shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
