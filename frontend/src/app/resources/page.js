"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import PolicyFilters from '@/features/resources/components/PolicyFilters';
import PoliciesGrid from '@/features/resources/components/PoliciesGrid';
import FormTemplatesGrid from '@/features/resources/components/FormTemplatesGrid';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadResources, setPage } from '@/features/resources/resourcesSlice';
import {
  selectResourcesList,
  selectResourcesLoading,
  selectResourcesError,
  selectCurrentPage,
  selectTotalPages,
} from '@/features/resources/resourcesSelectors';

export default function ResourcesPage() {
  const [tab, setTab] = useState('policies');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');

  const dispatch = useAppDispatch();
  const allResources = useAppSelector(selectResourcesList);
  const isLoading = useAppSelector(selectResourcesLoading);
  const error = useAppSelector(selectResourcesError);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);

  const RES_PER_PAGE = 6;

  useEffect(() => {
    // initial load or when filters/tab change: replace list
    dispatch(loadResources({ page: 1, limit: RES_PER_PAGE, append: false }));
    dispatch(setPage(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tab, search, date, type]);

  const typeOptions = useMemo(() => Array.from(new Set((allResources || []).map((r) => r.type))), [allResources]);

  const resources = useMemo(() => {
    return (allResources || []).filter((r) => {
      if (tab === 'policies' && r.category !== 'policies') return false;
      if (tab === 'forms' && r.category !== 'forms') return false;
      if (type && r.type !== type) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(`${r.title} ${r.description} ${r.department}`.toLowerCase().includes(s))) return false;
      }
      if (date) {
        try {
          const sel = new Date(date).toDateString();
          if (new Date(r.date).toDateString() !== sel) return false;
        } catch (e) {
          // ignore parse errors
        }
      }
      return true;
    });
  }, [allResources, tab, search, date, type]);

  const sentinelRef = useRef(null);

  const loadNext = useCallback(() => {
    if (isLoading) return;
    if (currentPage >= totalPages) return;
    const next = currentPage + 1;
    dispatch(loadResources({ page: next, limit: RES_PER_PAGE, append: true }));
    dispatch(setPage(next));
  }, [isLoading, currentPage, totalPages, dispatch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadNext();
        });
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext]);

  const breadcrumbChild = tab === 'policies' ? 'Policy' : 'Forms & Templates';

  const resourcesBgStyle = {
    backgroundImage: 'url(/policies-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={resourcesBgStyle}>
      <PageHeader title="Resources" breadcrumbs={[{ label: 'Resources' }, { label: breadcrumbChild }]} containerClassName="pt-xl pb-0 px-xl bg-transparent">
        <p className="text-body text-muted-foreground">Company policies, forms, and templates.</p>
        <PolicyFilters
          tab={tab}
          onTabChange={(val) => { setTab(val); }}
          search={search}
          onSearchChange={(val) => { setSearch(val); }}
          date={date}
          onDateChange={(val) => { setDate(val); }}
          type={type}
          onTypeChange={(val) => { setType(val); }}
          typeOptions={typeOptions}
        />
      </PageHeader>

      <main>
        <PageSection>
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{error}</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{date ? 'No data for that date' : 'No resources found'}</p>
            </div>
          ) : (
            <>
              {tab === 'policies' ? (
                <PoliciesGrid resources={resources} />
              ) : (
                <FormTemplatesGrid resources={resources} />
              )}
            </>
          )}
        </PageSection>
      </main>
    </div>
  );
}
