'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const STRAPI_ADMIN_URL =
  process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL || 'http://localhost:1337/admin';

function AdminRedirectInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      // No token — just go to admin login
      window.location.replace(STRAPI_ADMIN_URL);
      return;
    }

    try {
      // Strapi admin panel reads its auth token from localStorage under 'jwtToken'
      // It expects this to be a JSON-stringified string (with quotes)
      localStorage.setItem('jwtToken', `"${token}"`);
      sessionStorage.setItem('jwtToken', `"${token}"`);
    } catch {
      // localStorage unavailable — still attempt redirect
    }

    // Small delay so localStorage write settles before admin panel reads it
    const timer = setTimeout(() => {
      window.location.replace(STRAPI_ADMIN_URL);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        gap: '16px',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle cx="20" cy="20" r="17" stroke="#4f46e5" strokeWidth="3" opacity="0.25" />
        <path
          d="M20 3 A17 17 0 0 1 37 20"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontSize: '15px', color: '#a0a0a0' }}>
        Redirecting to Admin Panel…
      </p>
    </div>
  );
}

export default function AdminRedirectPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#0f0f0f',
            color: '#a0a0a0',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Loading…
        </div>
      }
    >
      <AdminRedirectInner />
    </Suspense>
  );
}
