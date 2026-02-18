'use client';

import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';

export default function PageContainer({ children, className }) {
  const { collapsed, isMobile } = useSidebar();

  // Always stretch content to full width, with responsive padding
  const baseClasses = 'w-full px-4 sm:px-6 lg:px-10';

  return <div className={cn(baseClasses, className)}>{children}</div>;
}

