'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SurfaceCard({ className, ...props }) {
  return (
    <Card
      className={cn(
        'border border-gray-200 bg-white rounded-[20px] shadow-sm',
        className
      )}
      {...props}
    />
  );
}
