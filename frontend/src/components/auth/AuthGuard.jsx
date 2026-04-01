'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loader from '@/components/common/Loader';
import { STORAGE_KEYS } from '@/lib/constants';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

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
  const [showResetPassword, setShowResetPassword] = useState(false);

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

  useEffect(() => {
    if (!isAuthorized) return;

    const userStr =
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEYS.USER)
        : null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        if (user?.is_first_login) {
          setShowResetPassword(true);
        }
      } catch (e) {
        console.error('User parse error:', e);
      }
    }
  }, [isAuthorized]);

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
  
   if (showResetPassword) {
    return (
      <ResetPasswordModal
        open={true}
        onSuccess={() => {
          setShowResetPassword(false);

          // update user in localStorage
          const userStr = localStorage.getItem(STORAGE_KEYS.USER);
          if (userStr) {
            const user = JSON.parse(userStr);
            user.is_first_login = false;
            localStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(user)
            );
          }
        }}
      />
    );
  }


  return <>{children}</>;
}
