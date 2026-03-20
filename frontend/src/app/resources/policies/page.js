"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import PolicyFilters from '@/features/resources/components/PolicyFilters';
import PoliciesGrid from '@/features/resources/components/PoliciesGrid';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadPolicies, setPage as setPoliciesPage } from '@/features/resources/policiesSlice';
import {
  selectPoliciesList,
  selectPoliciesLoading,
  selectPoliciesError,
  selectPoliciesCurrentPage,
  selectPoliciesTotalPages,
} from '@/features/resources/policiesSelectors';

export default function PoliciesPage() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  const policiesList = useAppSelector(selectPoliciesList);
  const policiesLoading = useAppSelector(selectPoliciesLoading);
  const policiesError = useAppSelector(selectPoliciesError);
  const policiesCurrentPage = useAppSelector(selectPoliciesCurrentPage);
  const policiesTotalPages = useAppSelector(selectPoliciesTotalPages);

  const RES_PER_PAGE = 6;

  useEffect(() => {
    dispatch(loadPolicies({ page: 1, limit: RES_PER_PAGE, append: false }));
    dispatch(setPoliciesPage(1));
  }, [dispatch]);

  const filteredPolicies = useMemo(() => {
    return (policiesList || []).filter((p) => {
      if (search) {
        const s = search.toLowerCase();
        if (!(`${p.title} ${p.description}`.toLowerCase().includes(s))) return false;
      }
      if (date) {
        try {
          const selected = new Date(date).toDateString();
          if (new Date(p.createdAt).toDateString() !== selected) return false;
        } catch (e) {
          return false;
        }
      }
      return true;
    });
  }, [policiesList, search, date]);

  const sentinelRef = useRef(null);

  const loadNext = useCallback(() => {
    if (policiesLoading) return;
    if (policiesCurrentPage >= policiesTotalPages) return;
    const next = policiesCurrentPage + 1;
    dispatch(loadPolicies({ page: next, limit: RES_PER_PAGE, append: true }));
    dispatch(setPoliciesPage(next));
  }, [dispatch, policiesLoading, policiesCurrentPage, policiesTotalPages]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadNext();
        });
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNext]);

  const resourcesBgStyle = {
    backgroundImage: 'url(/policies-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={resourcesBgStyle}>
      <PageHeader
        title="Resources"
        breadcrumbs={[{ label: 'Resources' }, { label: 'Policies' }]}
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      >
        <p className="text-body text-muted-foreground">Company policies, forms, and templates.</p>
        <PolicyFilters
          tab="policies"
          onTabChange={(val) => {
            if (val === 'forms-templates') router.push('/resources/forms-templates');
          }}
          search={search}
          onSearchChange={setSearch}
          date={date}
          onDateChange={setDate}
        />
      </PageHeader>

      <main>
        <PageSection>
          {policiesLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : policiesError ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{policiesError}</p>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">
                {date ? 'No data for that date' : 'No policies found'}
              </p>
            </div>
          ) : (
            <>
              <PoliciesGrid resources={filteredPolicies} />
              <div ref={sentinelRef} className="h-1 w-full" />
            </>
          )}
        </PageSection>
      </main>
    </div>
  );
}
