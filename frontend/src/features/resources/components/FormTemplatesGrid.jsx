"use client";

import { useState } from 'react';
import FormTemplateCard from './FormTemplateCard';
import PdfViewer from './PdfViewer';
import { X } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');

function getFileUrl(item) {
  if (item.form_type === 'URL' && item.form_url) return item.form_url;
  const media = item.form_pdf || item.form_excel || item.form_word;
  const m = Array.isArray(media) ? media[0] : media;
  const raw = m?.url ?? m?.data?.attributes?.url ?? m?.attributes?.url;
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

export default function FormTemplatesGrid({ resources }) {
  const [viewingDoc, setViewingDoc] = useState(null);
  const fileUrl = viewingDoc ? getFileUrl(viewingDoc) : '';
  const isPdf = viewingDoc?.form_type === 'PDF';
  const isUrl = viewingDoc?.form_type === 'URL';
  const isPdfOrUrl = isPdf || isUrl;

  return (
    <>
      <div className="mt-10 flex flex-col items-center gap-6">
        {resources.map((r) => (
          <div key={r.id} className="w-full flex justify-center">
            <FormTemplateCard resource={r} onView={(item) => setViewingDoc(item)} />
          </div>
        ))}
      </div>

      {viewingDoc && isPdfOrUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold truncate pr-4">{viewingDoc.title}</h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-4">
              {isPdf && fileUrl ? (
                <PdfViewer fileUrl={fileUrl} title={viewingDoc.title} className="w-full h-[70vh] border rounded-lg" />
              ) : isUrl && fileUrl ? (
                <iframe src={fileUrl} title={viewingDoc.title} className="w-full h-[70vh] border rounded-lg" />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
