"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, Calendar } from 'lucide-react';
import SurfaceCard from '@/components/common/SurfaceCard';

export default function PolicyFilters({
  tab,
  onTabChange,
  search,
  onSearchChange,
  date,
  onDateChange,
  type,
  onTypeChange,
  typeOptions = [],
}) {
  return (
    <div className='pt-4 pb-0'>
      <SurfaceCard className={cn('p-2 w-fit rounded-[12px]', tab !== 'forms' ? 'mb-6' : 'mb-0')}>
      <div className="flex items-center gap-3">
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('policies')}
                className={cn(
                    'h-10 w-auto rounded-[12px] px-2 py-2 text-sm font-sm leading-none',
                tab === 'policies'
                    ? 'bg-primary-purple text-white focus-visible:ring-2 focus-visible:ring-primary z-10 hover:bg-primary-purple hover:text-white'
                    : 'bg-transparent text-primary-purple hover:bg-transparent hover:text-primary-purple'
                )}
        >
            Policy
        </Button>

        <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('forms')}
                className={cn(
                    'h-10 w-auto rounded-[12px] px-2 py-2 text-sm font-sm leading-none',
                tab === 'forms'
                    ? 'bg-primary-purple text-white focus-visible:ring-2 focus-visible:ring-primary z-10 hover:bg-primary-purple hover:text-white'
                    : 'bg-transparent text-primary-purple hover:bg-transparent hover:text-primary-purple'
                )}
        >
            Forms & Templates
        </Button>
            </div>
          </SurfaceCard>
      {tab !== 'forms' && (
        <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-[repeat(4,232px)] lg:justify-start', tab === 'policies' ? '-mb-6' : '')}>
          <div className="relative w-full lg:w-[232px]">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-[12px] border border-gray-100 bg-white px-4 text-sm placeholder:text-[#C4C4C4] shadow-sm outline-none"
            />
          </div>

          <div className="relative w-full lg:w-[232px]">
            <input
              type="date"
              value={date || ''}
              onChange={(e) => onDateChange(e.target.value)}
              className={cn('h-10 w-full rounded-[12px] border border-gray-100 bg-white px-4 text-sm text-[#C4C4C4] placeholder:text-[#C4C4C4] shadow-sm outline-none',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]')}
            />
            <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4]" />
          </div>

          <div className="relative w-full lg:w-[232px]">
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className={cn('h-10 w-full appearance-none rounded-[12px] border border-gray-100 bg-white px-4 pr-10 text-sm text-[#C4C4C4] placeholder:text-[#C4C4C4] shadow-sm outline-none',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]')}
            >
              <option value="">Type</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4]" />
          </div>
        </div>
      )}
    </div>
  );
}
