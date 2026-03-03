"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Select({ value, onChange, options = [], placeholder = 'Select', textSize = 'text-sm' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={cn(
          'relative h-12 w-full rounded-[12px] border border-gray-100 bg-white px-4 pr-10 text-left text-small shadow-sm overflow-hidden',
          value ? 'text-black' : 'text-[#B3B3B3]'
        )}
      >
        <span className={cn('truncate pr-6', textSize)}>{value || placeholder}</span>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B3B3B3]" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-md ring-1 ring-black/5">
          <div className="flex flex-col py-2">
            <button
              type="button"
              onClick={() => { onChange && onChange(''); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-[#6B7280] hover:bg-gray-50"
            >
              {placeholder}
            </button>
            <div className="border-t border-gray-100 my-1" />
            {options.filter((o) => o !== '' && o != null).length === 0 ? (
              <div className="px-4 py-2 text-sm text-[#6B7280]">No options</div>
            ) : (
              options
                .filter((o) => o !== '' && o != null)
                .map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-[#374151] hover:bg-gray-50"
                  >
                    {opt}
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
