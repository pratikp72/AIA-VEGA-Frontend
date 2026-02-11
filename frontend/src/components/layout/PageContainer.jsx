'use client';

import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';

export default function PageContainer({ children, className }) {
  const { collapsed, isMobile } = useSidebar();

  const baseClasses =
    !isMobile && collapsed
      ? 'w-full px-4 sm:px-6 lg:px-8'
      : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return <div className={cn(baseClasses, className)}>{children}</div>;
}

