"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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
