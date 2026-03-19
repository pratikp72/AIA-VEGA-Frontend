"use client";

import SurfaceCard from '@/components/common/SurfaceCard';
import { Download, ExternalLink } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function getFileUrl(item) {
  const normalizedType = (item.form_type || item.type || '').toLowerCase();
  if (normalizedType === 'url' && item.form_url) return item.form_url;
  const media = item.form_pdf || item.form_excel || item.form_word;
  const m = Array.isArray(media) ? media[0] : media;
  const raw = m?.url ?? m?.data?.attributes?.url ?? m?.attributes?.url ?? item.fileUrl ?? item.downloadUrl ?? item.url ?? item.link ?? (item.file && item.file.url);
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

export default function FormTemplateCard({ resource }) {
  const item = resource || {};
  const ext = (item.form_type || item.type || '').toLowerCase();
  const formType = (item.form_type || item.type || '').toLowerCase();
  const isDownloadable = formType === 'pdf' || formType === 'excel' || formType === 'word';
  const isUrlType = formType === 'url';
  const fileUrl = getFileUrl(item);

  const iconBg = ext.includes('pdf')
    ? 'bg-[#F87171]'
    : ext.includes('xls') || ext.includes('excel')
    ? 'bg-[#34D399]'
    : 'bg-[#A78BFA]';

  const typeIcon = ext.includes('pdf')
    ? '/pdf-icon.png'
    : ext.includes('xls') || ext.includes('excel')
    ? '/excel-icon.png'
    : ext.includes('word') || ext.includes('doc')
    ? '/doc-icon.png'
    : ext.includes('url')
    ? '/url-icon.png'
    : null;

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!fileUrl) return;
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
    if (formType === 'pdf' || formType === 'excel' || formType === 'word') {
      triggerDownload();
    } else if (formType === 'url') {
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  return (
    <SurfaceCard
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
      className="w-full min-h-[85px] cursor-pointer p-4 flex flex-row items-start gap-4 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className={`flex items-center justify-center h-12 w-12 rounded-md overflow-hidden flex-shrink-0 p-1.5 ${typeIcon ? 'bg-gray-50' : iconBg + ' text-white'}`}>
        {typeIcon ? (
          <img src={typeIcon} alt={item.form_type || item.type || 'Document'} className="w-full h-full object-contain" />
        ) : (
          <span className="font-bold text-sm">{(item.form_type || item.type || 'DOC').slice(0,3).toUpperCase()}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">{item.title}</h4>
        </div>
        <p className="text-sm text-[#65758B]">{item.description}</p>
      </div>

      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {isUrlType ? (
          fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open URL"
              title="Open link"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-[8px] bg-primary-purple text-white flex items-center justify-center shadow shrink-0 hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )
        ) : (
          <button
            aria-label="download"
            onClick={handleDownload}
            disabled={!fileUrl}
            title={fileUrl ? 'Download' : 'No file available'}
            className={`w-10 h-10 rounded-[8px] bg-primary-purple text-white flex items-center justify-center shadow shrink-0 ${!fileUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </SurfaceCard>
  );
}
