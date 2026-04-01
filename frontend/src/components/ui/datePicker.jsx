"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const rows = [];
  let current = 1 - startDay;
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      if (current < 1 || current > days) {
        row.push(null);
      } else {
        row.push(current);
      }
      current++;
    }
    rows.push(row);
  }
  // Trim trailing fully-empty rows so calendar height adapts (e.g., Feb)
  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell == null)) {
    rows.pop();
  }
  return rows;
}

/** Parse YYYY-MM-DD as local date (avoids UTC midnight shifting the day) */
function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

/** Format Date to YYYY-MM-DD in local time (avoids toISOString UTC shift) */
function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DatePicker({ value, onChange, placeholder = 'Date', textSize = 'text-sm' }) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);
  const [view, setView] = useState(() => {
    const d = selected || new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const ref = useRef(null);

  useEffect(() => {
    if (selected && (view.year !== selected.getFullYear() || view.month !== selected.getMonth())) {
      setView({ year: selected.getFullYear(), month: selected.getMonth() });
    }
  }, [value, selected, view.year, view.month]);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    if (open) {
      window.addEventListener('scroll', onScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const monthMatrix = useMemo(() => getMonthMatrix(view.year, view.month), [view]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  function pick(day) {
    if (!day) return;
    const d = new Date(view.year, view.month, day);
    // prevent selecting future dates
    const dZero = new Date(d);
    dZero.setHours(0, 0, 0, 0);
    if (dZero > today) return;
    onChange(formatLocalDate(d));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="h-12 w-full rounded-[12px] border border-gray-100 bg-white px-4 text-left text-small shadow-sm flex items-center justify-between"
        >
          <span className={cn('truncate', textSize, selected ? 'text-black' : 'text-[#B3B3B3]')}>{selected ? selected.toLocaleDateString() : placeholder}</span>
          <div className="flex items-center gap-2">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange && onChange('');
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange && onChange('');
                    setOpen(false);
                  }
                }}
                aria-label="clear date"
                className="p-1 rounded hover:bg-gray-100 inline-flex items-center justify-center"
              >
                <X className="h-4 w-4 text-[#9CA3AF]" />
              </span>
            )}
            <CalIcon className="h-4 w-4 text-[#B3B3B3]" />
          </div>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full max-w-[340px] rounded-lg bg-white shadow-md ring-1 ring-black/5 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setView((v) => ({ ...v, month: v.month - 1 < 0 ? 11 : v.month - 1, year: v.month - 1 < 0 ? v.year - 1 : v.year }))} className="p-1">
              <ChevronLeft className="h-4 w-4 text-[#374151]" />
            </button>
            <div className="text-sm font-medium text-[#1F2937]">{new Date(view.year, view.month).toLocaleString('default', { month: 'long' })} {view.year}</div>
            <button type="button" onClick={() => setView((v) => ({ ...v, month: v.month + 1 > 11 ? 0 : v.month + 1, year: v.month + 1 > 11 ? v.year + 1 : v.year }))} className="p-1">
              <ChevronRight className="h-4 w-4 text-[#374151]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm text-[#6B7280] mb-2">
            <div className="text-center">Sun</div>
            <div className="text-center">Mon</div>
            <div className="text-center">Tue</div>
            <div className="text-center">Wed</div>
            <div className="text-center">Thu</div>
            <div className="text-center">Fri</div>
            <div className="text-center">Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthMatrix.flat().map((day, idx) => {
              const isSelected = selected && day && selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === day;
              if (!day) {
                return (
                  <div key={idx} className="flex items-center justify-center rounded text-transparent" style={{ height: '2rem', minWidth: '2rem' }}>
                    &nbsp;
                  </div>
                );
              }
              const dayDate = new Date(view.year, view.month, day);
              dayDate.setHours(0, 0, 0, 0);
              const isFuture = dayDate > today;
              return (
                <button
                  key={idx}
                  onClick={() => !isFuture && pick(day)}
                  disabled={isFuture}
                  aria-disabled={isFuture}
                  className={cn(
                    'flex items-center justify-center rounded',
                    isFuture ? 'text-[#9CA3AF] opacity-50 cursor-not-allowed' : 'text-[#374151] hover:bg-gray-100',
                    isSelected ? 'bg-primary text-white' : ''
                  )}
                  style={{
                    height: '2rem',
                    minWidth: '2rem',
                  }}
                >
                  <span className="text-sm sm:text-base leading-none">{day}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
