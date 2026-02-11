'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsPagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8 bg-card rounded-lg p-4 shadow-sm border-gray-200 hover:shadow-lg transition-shadow">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border-gray-200 hover:shadow-md"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page Numbers */}
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

      {/* Next Button */}
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
  );
}