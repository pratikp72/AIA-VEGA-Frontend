'use client';

import PageContainer from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils';

export default function PageSection({ children, className }) {
  return (
    <PageContainer className={cn('pt-0 pb-xl px-xl', className)}>
      {children}
    </PageContainer>
  );
}
