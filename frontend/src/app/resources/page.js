"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import PolicyFilters from '@/features/resources/components/PolicyFilters';
import PoliciesGrid from '@/features/resources/components/PoliciesGrid';
import FormTemplatesGrid from '@/features/resources/components/FormTemplatesGrid';
import { loadFormTemplates } from '@/features/resources/formTemplatesSlice';
import { selectFormTemplatesList, selectFormTemplatesLoading, selectFormTemplatesError } from '@/features/resources/formTemplatesSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadResources, setPage } from '@/features/resources/resourcesSlice';
import { loadPolicies, setPage as setPoliciesPage } from '@/features/resources/policiesSlice';
import {
  selectResourcesList,
  selectResourcesLoading,
  selectResourcesError,
  selectCurrentPage,
  selectTotalPages,
} from '@/features/resources/resourcesSelectors';
import {
  selectPoliciesList,
  selectPoliciesLoading,
  selectPoliciesError,
  selectPoliciesCurrentPage,
  selectPoliciesTotalPages,
} from '@/features/resources/policiesSelectors';

export default function ResourcesPage() {
  const [tab, setTab] = useState('policies');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');

  const dispatch = useAppDispatch();
  // Policies state
  const policiesList = useAppSelector(selectPoliciesList);
  const policiesLoading = useAppSelector(selectPoliciesLoading);
  const policiesError = useAppSelector(selectPoliciesError);
  const policiesCurrentPage = useAppSelector(selectPoliciesCurrentPage);
  const policiesTotalPages = useAppSelector(selectPoliciesTotalPages);
  // Resources state
  const allResources = useAppSelector(selectResourcesList);
  const isLoading = useAppSelector(selectResourcesLoading);
  const error = useAppSelector(selectResourcesError);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  // Form Templates state
  const formTemplates = useAppSelector(selectFormTemplatesList);
  const formTemplatesLoading = useAppSelector(selectFormTemplatesLoading);
  const formTemplatesError = useAppSelector(selectFormTemplatesError);

  const RES_PER_PAGE = 6;

  // Load policies or resources based on tab
  useEffect(() => {
    if (tab === 'policies') {
      dispatch(loadPolicies({ page: 1, limit: RES_PER_PAGE, append: false }));
      dispatch(setPoliciesPage(1));
    } else if (tab === 'forms-templates') {
      dispatch(loadFormTemplates());
    } else {
      dispatch(loadResources({ page: 1, limit: RES_PER_PAGE, append: false }));
      dispatch(setPage(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tab, search, date, type]);

  // Filter policies
  const filteredPolicies = useMemo(() => {
    return (policiesList || []).filter((p) => {
      if (type && p.type !== type) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(`${p.title} ${p.description}`.toLowerCase().includes(s))) return false;
      }
      if (date) {
        try {
          const sel = new Date(date).toDateString();
          if (new Date(p.createdAt).toDateString() !== sel) return false;
        } catch (e) {}
      }
      return true;
    });
  }, [policiesList, search, date, type]);

  // Filter resources
  const filteredResources = useMemo(() => {
    return (allResources || []).filter((r) => {
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
        } catch (e) {}
      }
      return true;
    });
  }, [allResources, tab, search, date, type]);

  // Infinite scroll for policies/resources
  const sentinelRef = useRef(null);

  const loadNext = useCallback(() => {
    if (tab === 'forms-templates') return;
    if (tab === 'policies') {
      if (policiesLoading) return;
      if (policiesCurrentPage >= policiesTotalPages) return;
      const next = policiesCurrentPage + 1;
      dispatch(loadPolicies({ page: next, limit: RES_PER_PAGE, append: true }));
      dispatch(setPoliciesPage(next));
    } else {
      if (isLoading) return;
      if (currentPage >= totalPages) return;
      const next = currentPage + 1;
      dispatch(loadResources({ page: next, limit: RES_PER_PAGE, append: true }));
      dispatch(setPage(next));
    }
  }, [tab, policiesLoading, policiesCurrentPage, policiesTotalPages, dispatch, isLoading, currentPage, totalPages]);

  useEffect(() => {
    if (tab === 'forms-templates') return;
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
  }, [tab, loadNext]);

  const breadcrumbChild = tab === 'policies' ? 'Policy' : 'Forms & Templates';

  const resourcesBgStyle = {
    backgroundImage: 'url(/policies-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // Type options
  const typeOptions = useMemo(() => {
    if (tab === 'policies') {
      return Array.from(new Set((policiesList || []).map((p) => p.type))).filter(Boolean);
    }
    return Array.from(new Set((allResources || []).map((r) => r.type))).filter(Boolean);
  }, [tab, policiesList, allResources]);

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
  {tab === 'policies' ? (
    policiesLoading ? (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    ) : policiesError ? (
      <div className="text-center py-20">
        <p className="text-body text-muted-foreground">{policiesError}</p>
      </div>
    ) : filteredPolicies.length === 0 ? (
      <div className="text-center py-20">
        <p className="text-body text-muted-foreground">{date ? 'No data for that date' : 'No policies found'}</p>
      </div>
    ) : (
      <PoliciesGrid resources={filteredPolicies} />
    )
  ) : (
    formTemplatesLoading ? (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    ) : formTemplatesError ? (
      <div className="text-center py-20">
        <p className="text-body text-muted-foreground">{formTemplatesError}</p>
      </div>
    ) : formTemplates.length === 0 ? (
      <div className="text-center py-20">
        <p className="text-body text-muted-foreground">No form templates found</p>
      </div>
    ) : (
      <FormTemplatesGrid resources={formTemplates} />
    )
  )}
</PageSection>
      </main>
    </div>
  );
}
