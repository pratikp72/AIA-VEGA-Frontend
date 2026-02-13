"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import SurfaceCard from '@/components/common/SurfaceCard';
import PageContainer from '@/components/layout/PageContainer';
import { MOCK_RESOURCES } from '@/services/mockData';
import PolicyDetail from '@/features/resources/components/PolicyDetail';

export default function ResourceDetailPage() {
  const params = useParams();
  const id = Number(params?.id || params?.slug || 0);

  const item = useMemo(() => MOCK_RESOURCES.find((r) => Number(r.id) === id) || null, [id]);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Resource" breadcrumbs={[{ label: 'Resources' }, { label: 'Not found' }]} containerClassName="pt-xl pb-0 px-xl">
          <p className="text-body text-muted-foreground">Resource not found</p>
        </PageHeader>
        <PageSection>
          <div className="text-center py-20">No resource found for id {id}</div>
        </PageSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader breadcrumbs={[{ label: 'Resources' }, { label: 'Policies' }]} containerClassName="pt-xl pb-0 px-xl">
        <div className="flex items-center gap-4">
          <Link href="/resources" className="text-sm text-primary hover:underline">&larr; Back to Policies</Link>
        </div>
      </PageHeader>

      <PageSection>
        <PolicyDetail item={item} />
      </PageSection>
    </div>
  );
}
