"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import PolicyFilters from '@/features/resources/components/PolicyFilters';
import FormTemplatesGrid from '@/features/resources/components/FormTemplatesGrid';
import { loadFormTemplates } from '@/features/resources/formTemplatesSlice';
import {
  selectFormTemplatesList,
  selectFormTemplatesLoading,
  selectFormTemplatesError,
} from '@/features/resources/formTemplatesSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function FormTemplatesPage() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  const formTemplates = useAppSelector(selectFormTemplatesList);
  const formTemplatesLoading = useAppSelector(selectFormTemplatesLoading);
  const formTemplatesError = useAppSelector(selectFormTemplatesError);

  const RES_PER_PAGE = 20;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(loadFormTemplates({ page: 1, limit: RES_PER_PAGE, search, date }));
    }, search ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [dispatch, search, date]);

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
          {formTemplatesLoading ? (
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
            <FormTemplatesGrid resources={formTemplates} />
          )}
        </PageSection>
      </main>
    </div>
  );
}
