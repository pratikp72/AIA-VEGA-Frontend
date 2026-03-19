"use client";

import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import Loader from '@/components/common/Loader';

/**
 * Fetches PDF with auth and displays via blob URL so it works on localhost
 * (avoids iframe cross-origin / X-Frame-Options issues)
 */
export default function PdfViewer({ fileUrl, title = 'PDF', className = '' }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobUrlRef = useRef(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!fileUrl) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl('');
      return;
    }
    setLoading(true);
    setError(null);
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(fileUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'same-origin',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load PDF: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load PDF');
        setBlobUrl('');
      })
      .finally(() => setLoading(false));

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [fileUrl]);

  if (loading) return <div className={`flex items-center justify-center min-h-[200px] ${className}`}><Loader size="lg" /></div>;
  if (error) return <div className={`flex items-center justify-center text-red-600 ${className}`}>{error}</div>;
  if (!blobUrl) return null;

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Custom read-only toolbar: title + zoom */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-700 truncate max-w-[50%]">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(25, z - 25))}
            disabled={zoom <= 25}
            className="w-8 h-8 rounded-md border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[40px] text-center select-none">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(500, z + 25))}
            disabled={zoom >= 500}
            className="w-8 h-8 rounded-md border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      <iframe key={zoom} src={`${blobUrl}#toolbar=0&navpanes=0&zoom=${zoom}`} title={title} className="w-full flex-1" />
    </div>
  );
}
