"use client";

import SurfaceCard from '@/components/common/SurfaceCard';
import { Calendar, Download, ExternalLink } from 'lucide-react';

export default function FormTemplateCard({ resource }) {
  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  const item = resource || {};

  const ext = (item.type || '').toLowerCase();

  const iconBg = ext.includes('pdf')
    ? 'bg-[#F87171]' // red
    : ext.includes('xls') || ext.includes('excel')
    ? 'bg-[#34D399]' // green
    : 'bg-[#A78BFA]'; // purple fallback

  return (
    <SurfaceCard role="button" tabIndex={0} className="w-full h-[85px] cursor-pointer p-4 flex flex-row items-center gap-4 py-0 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className={`flex items-center justify-center h-12 w-12 rounded-md text-white ${iconBg} flex-shrink-0`}>
        <span className="font-bold text-sm">{(item.type || 'DOC').slice(0,3).toUpperCase()}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold truncate">{item.title}</h4>
        </div>
        <p className="text-sm text-[#65758B] truncate">{item.description}</p>
      </div>

      <div className="flex items-center gap-3">
        <button aria-label="download" className="w-10 h-10 rounded-[8px] bg-primary-purple text-white flex items-center justify-center shadow">
          <Download className="w-4 h-4" />
        </button>
        <button aria-label="open" className="w-10 h-10 rounded-[8px] border border-primary-purple text-primary-purple bg-white flex items-center justify-center">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </SurfaceCard>
  );
}
