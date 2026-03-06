"use client";
import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LayoutShell from '@/components/layout/LayoutShell';
import ReduxProvider from '@/components/providers/ReduxProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const RootLayoutClient = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginPage = pathname.startsWith('/login');
  const isFeedbackScreen = searchParams.get('feedback') === '1';
  return (
    <ErrorBoundary>
      <ReduxProvider>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <LayoutShell hideSidebar={isFeedbackScreen}>{children}</LayoutShell>
        )}
        <ToastProvider />
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default RootLayoutClient;
