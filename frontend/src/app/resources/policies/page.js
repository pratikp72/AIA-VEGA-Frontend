"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function PoliciesPage() {
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  
  const policiesList = useAppSelector(selectPoliciesList);
  const policiesLoading = useAppSelector(selectPoliciesLoading);
  const policiesError = useAppSelector(selectPoliciesError);
  const policiesCurrentPage = useAppSelector(selectPoliciesCurrentPage);
  const policiesTotalPages = useAppSelector(selectPoliciesTotalPages);

  const RES_PER_PAGE = 24;

  // Load first page when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setPoliciesPage(1));
      dispatch(loadPolicies({ page: 1, limit: RES_PER_PAGE, search, date, append: false }));
    }, search ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [dispatch, search, date]);

  // Load next page on infinite scroll
  const handleLoadMore = useCallback(() => {
    const next = policiesCurrentPage + 1;
    dispatch(loadPolicies({ page: next, limit: RES_PER_PAGE, search, date, append: true }));
    dispatch(setPoliciesPage(next));
  }, [dispatch, policiesCurrentPage, search, date]);

  const sentinelRef = useInfiniteScroll({
    isLoading: policiesLoading,
    currentPage: policiesCurrentPage,
    totalPages: policiesTotalPages,
    onLoadMore: handleLoadMore,
  });

  // ── Sync filter state → URL search params (persistence across refresh) ──
  const isFirstUrlSync = useRef(true);
  const urlSyncTimerRef = useRef(null);
  useEffect(() => {
    if (isFirstUrlSync.current) {
      isFirstUrlSync.current = false;
      return;
    }
    if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
    urlSyncTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (search?.trim()) params.set('search', search.trim());
      if (date) {
        const dateStr = typeof date === 'string' ? date : date?.toISOString?.()?.slice(0, 10);
        if (dateStr) params.set('date', dateStr);
      }
      const qs = params.toString();
      const newUrl = `${pathname}${qs ? `?${qs}` : ''}`;
      window.history.replaceState(null, '', newUrl);
    }, 300);
    return () => {
      if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, date]);

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
          {policiesLoading && policiesCurrentPage === 1 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : policiesError ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{policiesError}</p>
            </div>
          ) : policiesList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">
                {search || date ? 'No policies found for the selected filters' : 'No policies found'}
              </p>
            </div>
          ) : (
            <>
              <PoliciesGrid resources={policiesList} />
              {/* Sentinel — triggers next page load when scrolled into view */}
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {policiesLoading && <Loader size="sm" />}
              </div>
            </>
          )}
        </PageSection>
      </main>
    </div>
  );
}
