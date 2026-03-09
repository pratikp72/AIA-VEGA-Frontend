'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loader from '@/components/common/Loader';
import { STORAGE_KEYS } from '@/lib/constants';

const LOGIN_PATH = '/login';

/**
 * AuthGuard – protects routes from unauthenticated access.
 * Redirects to /login if user tries to access protected routes without authToken.
 */
export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;

    if (pathname.startsWith(LOGIN_PATH)) {
      // If already logged in and on login page, redirect to home
      if (token) {
        router.replace('/home');
        return;
      }
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    // Protected route – require auth
    if (!token) {
      router.replace(LOGIN_PATH);
      return;
    }
    setIsAuthorized(true);
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
