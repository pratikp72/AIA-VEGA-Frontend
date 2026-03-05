"use client";

import SurfaceCard from '@/components/common/SurfaceCard';
import { Download, ExternalLink } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function getFileUrl(item) {
  if (item.form_type === 'URL' && item.form_url) return item.form_url;
  const media = item.form_pdf || item.form_excel || item.form_word;
  const m = Array.isArray(media) ? media[0] : media;
  const raw = m?.url ?? m?.data?.attributes?.url ?? m?.attributes?.url ?? item.fileUrl ?? item.downloadUrl ?? item.url ?? item.link ?? (item.file && item.file.url);
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

export default function FormTemplateCard({ resource, onView }) {
  const item = resource || {};
  const ext = (item.form_type || item.type || '').toLowerCase();
  const formType = (item.form_type || '').toLowerCase();
  const isDownloadable = item.is_downloadable === true || formType === 'excel' || formType === 'word';
  const isUrlType = item.form_type === 'URL';
  const fileUrl = getFileUrl(item);

  const iconBg = ext.includes('pdf')
    ? 'bg-[#F87171]'
    : ext.includes('xls') || ext.includes('excel')
    ? 'bg-[#34D399]'
    : 'bg-[#A78BFA]';

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!isDownloadable || !fileUrl) return;
    const filename = (item.title && item.title.replace(/[^a-z0-9\-_\.]/gi, '_')) || '';
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      try {
        const resp = await fetch(fileUrl);
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
        console.error('Download failed for', fileUrl, err2);
      }
    }
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!isUrlType || !fileUrl) return;
    window.open(fileUrl, '_blank', 'noopener');
  };

  const triggerDownload = () => {
    if (!fileUrl) return;
    const ext = (item.form_type || '').toLowerCase();
    const extMap = { pdf: '.pdf', excel: '.xlsx', word: '.docx' };
    const suffix = extMap[ext] || '';
    const filename = (item.title && item.title.replace(/[^a-z0-9\-_\.]/gi, '_')) || 'download' + suffix;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCardClick = () => {
    if (!fileUrl) return;
    const formType = (item.form_type || '').toLowerCase();
    if (formType === 'pdf' && onView) {
      onView(item);
    } else if (formType === 'excel' || formType === 'word') {
      triggerDownload();
    } else if (formType === 'url' && onView) {
      onView(item);
    } else if (onView) {
      onView(item);
    } else {
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  return (
    <SurfaceCard
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
      className="w-full h-[85px] cursor-pointer p-4 flex flex-row items-center gap-4 py-0 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className={`flex items-center justify-center h-12 w-12 rounded-md text-white ${iconBg} flex-shrink-0`}>
        <span className="font-bold text-sm">{(item.form_type || item.type || 'DOC').slice(0,3).toUpperCase()}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold truncate">{item.title}</h4>
        </div>
        <p className="text-sm text-[#65758B] truncate">{item.description}</p>
      </div>

      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="download"
          onClick={handleDownload}
          disabled={!fileUrl || !(isDownloadable)}
          title={fileUrl && isDownloadable ? 'Download' : !isDownloadable ? 'Download not available' : 'No file available'}
          className={`w-10 h-10 rounded-[8px] bg-primary-purple text-white flex items-center justify-center shadow ${!fileUrl || !isDownloadable ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          aria-label="open"
          onClick={handleOpen}
          disabled={!isUrlType || !fileUrl}
          title={isUrlType && fileUrl ? 'Open in new tab' : !isUrlType ? 'Redirect only for URL type' : 'No link available'}
          className={`w-10 h-10 rounded-[8px] border border-primary-purple text-primary-purple bg-white flex items-center justify-center ${!isUrlType || !fileUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </SurfaceCard>
  );
}
