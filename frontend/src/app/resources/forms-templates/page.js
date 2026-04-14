"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import PolicyFilters from '@/features/resources/components/PolicyFilters';
import FormTemplatesGrid from '@/features/resources/components/FormTemplatesGrid';
import { loadFormTemplates, setPage as setFormTemplatesPage } from '@/features/resources/formTemplatesSlice';
import {
  selectFormTemplatesList,
  selectFormTemplatesLoading,
  selectFormTemplatesError,
  selectFormTemplatesCurrentPage,
  selectFormTemplatesTotalPages,
} from '@/features/resources/formTemplatesSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function FormTemplatesPage() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Restore filters from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlDate = searchParams.get('date');
    if (urlSearch) setSearch(urlSearch);
    if (urlDate) setDate(urlDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formTemplates = useAppSelector(selectFormTemplatesList);
  const formTemplatesLoading = useAppSelector(selectFormTemplatesLoading);
  const formTemplatesError = useAppSelector(selectFormTemplatesError);
  const currentPage = useAppSelector(selectFormTemplatesCurrentPage);
  const totalPages = useAppSelector(selectFormTemplatesTotalPages);

  const RES_PER_PAGE = 24;

  // Load first page when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFormTemplatesPage(1));
      dispatch(loadFormTemplates({ page: 1, limit: RES_PER_PAGE, search, date, append: false }));
    }, search ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [dispatch, search, date]);

  // Load next page on infinite scroll
  const handleLoadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    dispatch(loadFormTemplates({ page: nextPage, limit: RES_PER_PAGE, search, date, append: true }));
    dispatch(setFormTemplatesPage(nextPage));
  }, [dispatch, currentPage, search, date]);

  const sentinelRef = useInfiniteScroll({
    isLoading: formTemplatesLoading,
    currentPage,
    totalPages,
    onLoadMore: handleLoadMore,
  });

  // ── Sync filter state → URL search params (persistence across refresh) ──
  const isFirstUrlSync = useRef(true);
  useEffect(() => {
    if (isFirstUrlSync.current) {
      isFirstUrlSync.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
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
    return () => clearTimeout(timeoutId);
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
        breadcrumbs={[{ label: 'Resources' }, { label: 'Forms & Templates' }]}
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      >
        <p className="text-body text-muted-foreground">Company policies, forms, and templates.</p>
        <PolicyFilters
          tab="forms-templates"
          onTabChange={(val) => {
            if (val === 'policies') router.push('/resources/policies');
          }}
          search={search}
          onSearchChange={setSearch}
          date={date}
          onDateChange={setDate}
        />
      </PageHeader>

      <main>
        <PageSection>
          {formTemplatesLoading && currentPage === 1 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : formTemplatesError ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{formTemplatesError}</p>
            </div>
          ) : formTemplates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">
                {search || date ? 'No form templates found for the selected filters' : 'No form templates found'}
              </p>
            </div>
          ) : (
            <>
              <FormTemplatesGrid resources={formTemplates} />
              {/* Sentinel — triggers next page load when scrolled into view */}
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {formTemplatesLoading && <Loader size="sm" />}
              </div>
            </>
          )}
        </PageSection>
      </main>
    </div>
  );
}
