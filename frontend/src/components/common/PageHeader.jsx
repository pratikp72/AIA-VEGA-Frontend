'use client';

import PageContainer from '@/components/layout/PageContainer';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { cn } from '@/lib/utils';

export default function PageHeader({
  title,
  breadcrumbs = [],
  showBreadcrumbSeparator = false,
  right,
  className,
  containerClassName,
  children,
}) {
  return (
    <div className={cn('bg-card', className)}>
      <PageContainer className={cn('pt-xl pb-md px-xl', containerClassName)}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <Breadcrumbs items={breadcrumbs} showTrailingSeparator={showBreadcrumbSeparator} />
          {right ? right : null}
        </div>
        {title ? <h1 className="text-h1 text-gray-dark">{title}</h1> : null}
        {children ? <div className="mt-2">{children}</div> : null}
      </PageContainer>
    </div>
  );
}
