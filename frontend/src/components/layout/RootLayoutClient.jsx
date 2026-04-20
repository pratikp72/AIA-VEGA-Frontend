"use client";
import React, { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LayoutShell from '@/components/layout/LayoutShell';
import ReduxProvider from '@/components/providers/ReduxProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AuthGuard from '@/components/auth/AuthGuard';
import useTelemetryTracking from '@/hooks/useTelemetryTracking';

const RootLayoutInner = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useTelemetryTracking(pathname, searchParams);
  const isPublicAuthPage = pathname.startsWith('/login') || pathname.startsWith('/reset-password');
  const isFeedbackScreen = searchParams.get('feedback') === '1';
  return (
    <AuthGuard>
      {isPublicAuthPage ? (
        <>{children}</>
      ) : (
        <LayoutShell hideSidebar={isFeedbackScreen}>{children}</LayoutShell>
      )}
    </AuthGuard>
  );
};

const RootLayoutClient = ({ children }) => {
  return (
    <ErrorBoundary>
      <ReduxProvider>
        <Suspense fallback={null}>
          <RootLayoutInner>{children}</RootLayoutInner>
        </Suspense>
        <ToastProvider />
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default RootLayoutClient;
