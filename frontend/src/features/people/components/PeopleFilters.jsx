"use client";

import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PeopleFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  departmentFilter,
  onDepartmentChange,
  locationFilter,
  onLocationChange,
  departmentOptions,
  locationOptions,
}) {
  return (
    <>
      <p className="text-body text-muted-foreground">Find and connect with colleagues across the organization</p>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[repeat(4,232px)] lg:justify-start">
        <div className="relative w-full lg:w-[232px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4]" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="h-12 w-full rounded-[12px] border border-gray-200 bg-white px-4 pl-10 text-muted-foreground placeholder:text-[#B3B3B3] shadow-[0_0_6px_rgba(0,0,0,0.09)]"
          />
        </div>

        <div className="group relative w-full lg:w-[232px]">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={cn(
              'h-12 w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-small shadow-[0_0_6px_rgba(0,0,0,0.09)] hover:bg-white focus:bg-white active:bg-white focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              sortBy ? 'text-black' : 'text-[#C4C4C4]'
            )}
          >
            <option value="">Sort By</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="join-newest">Join Date (Newest)</option>
            <option value="join-oldest">Join Date (Oldest)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4] transition-transform rotate-0 group-focus-within:rotate-180" />
        </div>

        <div className="group relative w-full lg:w-[232px]">
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className={cn(
              'h-12 w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-small shadow-[0_0_6px_rgba(0,0,0,0.09)] hover:bg-white focus:bg-white active:bg-white focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              departmentFilter ? 'text-black' : 'text-[#C4C4C4]'
            )}
          >
            <option value="">Department</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4] transition-transform rotate-0 group-focus-within:rotate-180" />
        </div>

        <div className="group relative w-full lg:w-[232px]">
          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className={cn(
              'h-12 w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-small shadow-[0_0_6px_rgba(0,0,0,0.09)] hover:bg-white focus:bg-white active:bg-white focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              locationFilter ? 'text-black' : 'text-[#C4C4C4]'
            )}
          >
            <option value="">Location</option>
            {locationOptions.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4] transition-transform rotate-0 group-focus-within:rotate-180" />
        </div>
      </div>
    </>
  );
}
