"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SurfaceCard from '@/components/common/SurfaceCard';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Select from '@/components/ui/select';
import DatePicker from '@/components/ui/datePicker';

export default function Filters({
  // tabs
  tab,
  onTabChange,
  tabs = [],

  // search
  search,
  onSearchChange,
  searchPlaceholder = 'Search',

  // date
  date,
  onDateChange,
  showDate = true,

  // show search input
  showSearch = true,

  // selects: array of { value, onChange, options, placeholder }
  selects = [],

  // extra elements rendered after selects in the same row (e.g. a Reset button)
  children,

  className = '',
}) {
  return (
    <div className={cn('pt-4 pb-0', className)}>
      {tabs.length > 0 && (
        <SurfaceCard className={cn('p-2 w-fit rounded-[12px]', tab === 'forms' ? 'mb-0' : 'mb-4', 'shadow-[0_0_6px_rgba(0,0,0,0.09)]')}>
          <div className="flex items-center gap-3">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange && onTabChange(t.key)}
                  className={cn(
                    'h-10 w-auto rounded-[12px] p-2 text-sm font-sm leading-none',
                  tab === t.key
                    ? 'bg-primary-purple text-white focus-visible:ring-2 focus-visible:ring-primary z-10 hover:bg-primary-purple hover:text-white'
                    : 'bg-transparent text-primary-purple hover:bg-transparent hover:text-primary-purple'
                )}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </SurfaceCard>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[repeat(4,248px)] lg:justify-start">
        {/* Search */}
        {showSearch && (
          <div className="relative w-full lg:w-[248px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B3B3B3]" />
            <Input
              value={search}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-[12px] border border-gray-100 bg-white px-4 pl-10 text-sm text-muted-foreground placeholder:text-[#B3B3B3] shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] selection:bg-gray-200 selection:text-current"
            />
          </div>
        )}

        {/* Date */}
        {showDate && (
          <div className="relative w-full lg:w-[248px]">
            <DatePicker value={date} onChange={onDateChange} placeholder="Date" textSize="text-sm" />
          </div>
        )}

        {/* Dynamic selects */}
        {selects.map((s, idx) => (
          <div key={idx} className="group relative w-full lg:w-[248px]">
            <Select value={s.value} onChange={s.onChange} options={s.options || []} placeholder={s.placeholder} textSize="text-sm" />
          </div>
        ))}

        {/* Extra actions (e.g. Reset filters button) */}
        {children && (
          <div className="flex items-center w-full lg:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
