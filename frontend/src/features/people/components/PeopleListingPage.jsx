'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Filters from '@/components/common/Filters';
import PeopleGrid from './PeopleGrid';
import PeopleDetail from './PeopleDetail';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseFilterParam, serializeFilterParam, hasFilterValue } from '@/lib/filterParams';
import {
  loadPeople,
  loadPeopleOptions,
  setCompanyFilter,
  setPage,
} from '@/features/people/peopleSlice';
import {
  selectPeopleList,
  selectPeopleLoading,
  selectPeopleError,
  selectPeoplePage,
  selectPeopleTotalPages,
  selectPeopleTotalCount,
  selectPeopleCompanyFilter,
  selectPeopleDepartmentOptions,
  selectPeopleDesignationOptions,
  selectPeopleLocationOptions,
} from '@/features/people/peopleSelectors';

const PER_PAGE = 10;
const AUTO_PER_PAGE = 'auto';
const PER_PAGE_OPTIONS = [10, 25, 50, 100, { value: AUTO_PER_PAGE, label: 'All Users' }];
const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Join Date (Newest)', value: 'join-newest' },
  { label: 'Join Date (Oldest)', value: 'join-oldest' },
];

export default function PeopleListingPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const urlCompany = searchParams.get('company') ?? '';
  const targetPersonId = searchParams.get('personId') ?? '';
  const targetPersonEmpId = searchParams.get('personEmpId') ?? '';
  const targetPersonName = searchParams.get('personName') ?? '';
  const targetPersonCompany = searchParams.get('personCompany') ?? '';
  const hasTargetFromHome = Boolean(targetPersonId || targetPersonEmpId || targetPersonName);

  const people = useAppSelector(selectPeopleList);
  const isLoading = useAppSelector(selectPeopleLoading);
  const error = useAppSelector(selectPeopleError);
  const currentPage = useAppSelector(selectPeoplePage);
  const totalPages = useAppSelector(selectPeopleTotalPages);
  const totalCount = useAppSelector(selectPeopleTotalCount);
  const companyFilter = useAppSelector(selectPeopleCompanyFilter);
  const departmentOptions = useAppSelector(selectPeopleDepartmentOptions);
  const designationOptions = useAppSelector(selectPeopleDesignationOptions);
  const locationOptions = useAppSelector(selectPeopleLocationOptions);

  // Immediate search input value (shown in the input box); init from URL when coming from global search
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  // Debounced value — updated 350ms after the user stops typing (init from URL when from global search)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? '');
  const [departmentFilter, setDepartmentFilter] = useState(() => parseFilterParam(searchParams.get('department')));
  const [designationFilter, setDesignationFilter] = useState(() => parseFilterParam(searchParams.get('designation')));
  const [locationFilter, setLocationFilter] = useState(() => parseFilterParam(searchParams.get('location')));
  const [perPage, setPerPage] = useState(() => {
    const urlPerPage = searchParams.get('perPage');
    if (urlPerPage === AUTO_PER_PAGE) return AUTO_PER_PAGE;
    return Number(urlPerPage) || PER_PAGE;
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const isAutoMode = perPage === AUTO_PER_PAGE;
  const resolvedPageSize = isAutoMode ? 100 : Number(perPage) || PER_PAGE;

  // IntersectionObserver for infinite scroll in auto mode
  const handleLoadMore = useCallback(() => {
    dispatch(setPage(currentPage + 1));
  }, [currentPage, dispatch]);

  const sentinelRef = useInfiniteScroll({
    isLoading,
    currentPage,
    totalPages,
    onLoadMore: handleLoadMore,
    rootMargin: '200px 0px',
    threshold: 0.01,
    enabled: isAutoMode, // Only activate in auto mode
  });

  // Track which company's options have already been loaded so we never
  // fire /analytics/departments + /analytics/unit-locations simultaneously
  // with the employees request.
  const optionsCompanyRef = useRef(null);

  const lastAppliedUrlCompanyRef = useRef(null);
  useEffect(() => {
    const normalizedUrlCompany = urlCompany ? (urlCompany.toUpperCase() === 'VEGA' ? 'VEGA' : 'AIA') : 'AIA';
    if (lastAppliedUrlCompanyRef.current === normalizedUrlCompany) return;
    lastAppliedUrlCompanyRef.current = normalizedUrlCompany;
    if (companyFilter !== normalizedUrlCompany) {
      dispatch(setCompanyFilter(normalizedUrlCompany));
      dispatch(setPage(1));
    }
  }, [urlCompany, companyFilter, dispatch]);

  // When global search navigates to /people while this page is already open,
  // sync URL search param back into local input/debounce state.
  useEffect(() => {
    setSearchTerm((prev) => (prev === initialSearch ? prev : initialSearch));
    setDebouncedSearch((prev) => (prev === initialSearch ? prev : initialSearch));
    dispatch(setPage(1));
  }, [initialSearch, dispatch]);

  // Debounce: update debouncedSearch 350ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      dispatch(setPage(1)); // reset to first page on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Main fetch: fires whenever any filter or page changes.
  // Options (departments / locations) are loaded AFTER employees resolve,
  // and only when the company has changed — never simultaneously.
  useEffect(() => {
    dispatch(
      loadPeople({
        company: companyFilter,
        department: departmentFilter,
        designation: designationFilter,
        location: locationFilter,
        search: debouncedSearch,
        sort: sortBy,
        page: currentPage,
        pageSize: resolvedPageSize,
        append: isAutoMode && currentPage > 1,
      })
    ).then(() => {
      if (optionsCompanyRef.current !== companyFilter) {
        optionsCompanyRef.current = companyFilter;
        dispatch(loadPeopleOptions(companyFilter));
      }
    });
  }, [companyFilter, departmentFilter, designationFilter, locationFilter, debouncedSearch, sortBy, currentPage, resolvedPageSize, isAutoMode, dispatch]);

  // ── Sync filter/sort state → URL search params (persistence across refresh) ──
  useEffect(() => {
    const params = new URLSearchParams();
    // Preserve person-targeting params
    if (targetPersonId) params.set('personId', targetPersonId);
    if (targetPersonEmpId) params.set('personEmpId', targetPersonEmpId);
    if (targetPersonName) params.set('personName', targetPersonName);
    if (targetPersonCompany) params.set('personCompany', targetPersonCompany);
    // Filter / sort params (omit defaults to keep URL clean)
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (companyFilter && companyFilter !== 'AIA') params.set('company', companyFilter);
    if (sortBy) params.set('sortBy', sortBy);
    const departmentParam = serializeFilterParam(departmentFilter);
    const designationParam = serializeFilterParam(designationFilter);
    const locationParam = serializeFilterParam(locationFilter);
    if (departmentParam) params.set('department', departmentParam);
    if (designationParam) params.set('designation', designationParam);
    if (locationParam) params.set('location', locationParam);
    if (perPage !== PER_PAGE) params.set('perPage', String(perPage));

    const qs = params.toString();
    const newUrl = `${pathname}${qs ? `?${qs}` : ''}`;
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, departmentFilter, designationFilter, locationFilter, debouncedSearch, companyFilter, perPage, pathname, router]);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    dispatch(setPage(1));
  };

  const handleCompanySwitch = (company) => {
    dispatch(setCompanyFilter(company));
    dispatch(setPage(1));
    setDepartmentFilter([]);
    setDesignationFilter([]);
    setLocationFilter([]);
    setSearchTerm('');
    setDebouncedSearch('');
    setSortBy('');
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setPage(page));
  };

  const handlePerPageChange = (n) => {
    const nextPerPage = n === AUTO_PER_PAGE ? AUTO_PER_PAGE : Number(n) || PER_PAGE;
    setPerPage(nextPerPage);
    dispatch(setPage(1));
    setSelectedEmployeeId(null);
  };

  const handleSelect = (personId) => {
    setSelectedEmployeeId((current) => (current === personId ? null : personId));
  };

  const selectedEmployee = people.find((p) => p.id === selectedEmployeeId) || null;
  const isCompact = Boolean(selectedEmployee);

  const matchesTargetPerson = (person) => {
    if (!person) return false;
    if (targetPersonId && String(person.id) === String(targetPersonId)) return true;
    if (targetPersonEmpId && String(person.emp_id) === String(targetPersonEmpId)) return true;
    if (targetPersonName && String(person.name || '').trim().toLowerCase() === String(targetPersonName).trim().toLowerCase()) return true;
    return false;
  };

  const employeesBgStyle = {
    backgroundImage: 'url(/feedback-form-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'right center',
    backgroundRepeat: 'no-repeat',
  };

  const hasActiveFilters =
    sortBy ||
    hasFilterValue(departmentFilter) ||
    hasFilterValue(designationFilter) ||
    hasFilterValue(locationFilter) ||
    searchTerm;

  const handleResetFilters = () => {
    setSortBy('');
    setDepartmentFilter([]);
    setDesignationFilter([]);
    setLocationFilter([]);
    setSearchTerm('');
    setDebouncedSearch('');
    dispatch(setPage(1));
    
    // Immediately clear filter params from URL (preserve person-targeting params)
    const params = new URLSearchParams();
    if (targetPersonId) params.set('personId', targetPersonId);
    if (targetPersonEmpId) params.set('personEmpId', targetPersonEmpId);
    if (targetPersonName) params.set('personName', targetPersonName);
    if (targetPersonCompany) params.set('personCompany', targetPersonCompany);
    if (companyFilter && companyFilter !== 'AIA') params.set('company', companyFilter);
    const qs = params.toString();
    const newUrl = `${pathname}${qs ? `?${qs}` : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  useEffect(() => {
    if (!hasTargetFromHome) return;
    setSortBy('');
    setDepartmentFilter([]);
    setDesignationFilter([]);
    setLocationFilter([]);
    setSearchTerm('');
    setDebouncedSearch('');
    if (targetPersonCompany) {
      const normalised = targetPersonCompany.toUpperCase() === 'VEGA' ? 'VEGA' : 'AIA';
      dispatch(setCompanyFilter(normalised));
    }
    setPerPage(AUTO_PER_PAGE);
    dispatch(setPage(1));
  }, [hasTargetFromHome, targetPersonName, targetPersonCompany, dispatch]);

  useEffect(() => {
    if (!hasTargetFromHome) return;
    if (people.length === 0) return;

    const match = people.find(matchesTargetPerson);
    if (!match) return;

    setSelectedEmployeeId(match.id);
  }, [hasTargetFromHome, people, targetPersonId, targetPersonEmpId, targetPersonName]);

  useEffect(() => {
    if (!hasTargetFromHome) return;
    if (isLoading) return;
    if (people.some(matchesTargetPerson)) return;
    if (isAutoMode && currentPage < totalPages) {
      dispatch(setPage(currentPage + 1));
    }
  }, [hasTargetFromHome, isLoading, people, isAutoMode, currentPage, totalPages, dispatch, targetPersonId, targetPersonEmpId, targetPersonName]);

  if (isLoading && people.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]" style={employeesBgStyle}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]" style={employeesBgStyle}>
      <PageHeader
        title="Employees"
        breadcrumbs={[{ label: 'Employee Directory' }]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-xl px-xl bg-transparent"
        right={
          <div className="flex items-center rounded-xl border border-primary">
            <Button
              type="button"
              onClick={() => handleCompanySwitch('AIA')}
              className={cn(
                'h-8.5 px-4 text-small font-medium rounded-r-none rounded-l-xl shadow-none',
                companyFilter === 'AIA'
                  ? 'bg-primary text-white hover:bg-primary'
                  : 'bg-white text-primary hover:bg-white'
              )}
            >
              AIA
            </Button>
            <Button
              type="button"
              onClick={() => handleCompanySwitch('VEGA')}
              className={cn(
                'h-8.5 px-4 text-small font-medium rounded-l-none rounded-r-xl shadow-none',
                companyFilter === 'VEGA'
                  ? 'bg-primary text-white hover:bg-primary'
                  : 'bg-white text-primary hover:bg-white'
              )}
            >
              VEGA
            </Button>
          </div>
        }
      >
        <Filters
          search={searchTerm}
          onSearchChange={(val) => setSearchTerm(val)}
          searchPlaceholder="Search by Name, Employee ID"
          showDate={false}
          selects={[
            {
              value: sortBy,
              onChange: handleFilterChange(setSortBy),
              options: SORT_OPTIONS,
              placeholder: 'Sort By',
              multiSelect: false,
            },
            {
              value: departmentFilter,
              onChange: handleFilterChange(setDepartmentFilter),
              options: departmentOptions,
              placeholder: 'Department',
              variant: 'filter',
            },
            {
              value: designationFilter,
              onChange: handleFilterChange(setDesignationFilter),
              options: designationOptions,
              placeholder: 'Designation',
              variant: 'filter',
            },
            {
              value: locationFilter,
              onChange: handleFilterChange(setLocationFilter),
              options: locationOptions,
              placeholder: 'Location',
              variant: 'filter',
            },
          ]}
        >
          {hasActiveFilters && (
            <Button
              type="button"
              onClick={handleResetFilters}
              className="h-12 px-4 rounded-[12px] border border-gray-100 bg-white text-primary font-medium text-base shadow-none hover:bg-gray-100"
            >
              Reset filters
            </Button>
          )}
        </Filters>
      </PageHeader>

      <PageSection className="pt-0">
        {error ? (
          <div className="text-center py-20">
            <p className="text-body text-muted-foreground">{error}</p>
          </div>
        ) : people.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-body text-muted-foreground">No employees found</p>
          </div>
        ) : (
          <>
            <div className="relative">
              {isLoading && people.length > 0 && !isAutoMode && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl min-h-50">
                  <Loader size="lg" />
                </div>
              )}
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                <PeopleGrid
                pagedPeople={people}
                selectedEmployeeId={selectedEmployeeId}
                handleSelect={handleSelect}
                isCompact={isCompact}
              />
              {selectedEmployee && (
                <PeopleDetail
                  selectedEmployee={selectedEmployee}
                  onClose={() => setSelectedEmployeeId(null)}
                />
              )}
              </div>
            </div>

            {isAutoMode ? (
              <>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="text-sm" style={{ color: 'var(--color-primary)' }}>
                    Showing {people.length} of {totalCount} employees
                  </div>
                  <div className="relative inline-flex">
                    <select
                      value={String(perPage)}
                      onChange={(e) => handlePerPageChange(e.target.value)}
                      className="appearance-none rounded-full px-4 py-1 text-sm pr-7"
                      aria-label="Items per page"
                      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none' }}
                    >
                      {PER_PAGE_OPTIONS.map((opt) => {
                        const value = typeof opt === 'object' ? opt.value : opt;
                        const label = typeof opt === 'object' ? opt.label : `${opt} per page`;
                        return (
                          <option key={String(value)} value={String(value)} className="text-black">
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {currentPage < totalPages && (
                  <div ref={sentinelRef} className="mt-4 flex justify-center py-4">
                    {isLoading ? <Loader size="sm" /> : <span className="text-small text-muted-foreground">Scroll to load more</span>}
                  </div>
                )}
              </>
            ) : (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showSummary
                totalCount={totalCount}
                perPageOptions={PER_PAGE_OPTIONS}
                perPage={perPage}
                onPerPageChange={handlePerPageChange}
                className="mt-6"
              />
            )}
          </>
        )}
      </PageSection>
    </div>
  );
}
