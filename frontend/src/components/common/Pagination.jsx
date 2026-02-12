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
  className,
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {showSummary ? (
        <div className="flex items-center justify-between text-small text-muted-foreground">
          <span>Total Count : {totalCount ?? 0}</span>
          {perPageLabel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onPerPageClick}
              className="rounded-full"
            >
              {perPageLabel}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}

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

      {pages.map((page) => (
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
      ))}

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
  );
}
