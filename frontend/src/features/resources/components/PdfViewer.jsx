"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * Fetches PDF with auth and displays via blob URL so it works on localhost
 * (avoids iframe cross-origin / X-Frame-Options issues)
 */
export default function PdfViewer({ fileUrl, title = 'PDF', className = '' }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobUrlRef = useRef(null);

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

  if (loading) return <div className={`flex items-center justify-center text-gray-500 ${className}`}>Loading PDF...</div>;
  if (error) return <div className={`flex items-center justify-center text-red-600 ${className}`}>{error}</div>;
  if (!blobUrl) return null;

  return <iframe src={blobUrl} title={title} className={className} />;
}
