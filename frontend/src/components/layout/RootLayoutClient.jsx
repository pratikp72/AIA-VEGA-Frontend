"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import LayoutShell from '@/components/layout/LayoutShell';
import ReduxProvider from '@/components/providers/ReduxProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const RootLayoutClient = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith('/login');
  return (
    <ErrorBoundary>
      <ReduxProvider>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <LayoutShell>{children}</LayoutShell>
        )}
        <ToastProvider />
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default RootLayoutClient;
