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
        {(() => {
          const getItemUrl = () => {
            return (
              item.fileUrl ||
              item.downloadUrl ||
              item.url ||
              item.link ||
              item.externalUrl ||
              (item.file && item.file.url) ||
              ''
            );
          };

          const handleDownload = async (e) => {
            e.stopPropagation();
            const url = getItemUrl();
            if (!url) return;
            const filename = (item.title && item.title.replace(/[^a-z0-9\-_\.]/gi, '_')) || '';
            try {
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
            } catch (err) {
              try {
                const resp = await fetch(url);
                const blob = await resp.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);
              } catch (err2) {
                // fallback: do nothing (prevent opening a new tab)
                console.error('Download failed for', url, err2);
              }
            }
          };

          const handleOpen = (e) => {
            e.stopPropagation();
            const url = getItemUrl();
            if (!url) return;
            window.open(url, '_blank', 'noopener');
          };

          const url = getItemUrl();

          return (
            <>
              <button
                aria-label="download"
                onClick={handleDownload}
                disabled={!url}
                title={url ? 'Download' : 'No file available'}
                className={`w-10 h-10 rounded-[8px] bg-primary-purple text-white flex items-center justify-center shadow ${!url ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Download className="w-4 h-4" />
              </button>

              <button
                aria-label="open"
                onClick={handleOpen}
                disabled={!url}
                title={url ? 'Open in new tab' : 'No link available'}
                className={`w-10 h-10 rounded-[8px] border border-primary-purple text-primary-purple bg-white flex items-center justify-center ${!url ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          );
        })()}
      </div>
    </SurfaceCard>
  );
}
