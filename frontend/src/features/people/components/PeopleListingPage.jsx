'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  Briefcase,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building2,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import SurfaceCard from '@/components/common/SurfaceCard';
import Filters from '@/components/common/Filters';
import PeopleGrid from './PeopleGrid';
import PeopleDetail from './PeopleDetail';
import Loader from '@/components/common/Loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/common/Pagination';
import { cn } from '@/lib/utils';
import { loadPeople, setCompanyFilter, setPage } from '@/features/people/peopleSlice';
import {
  selectPeopleList,
  selectPeopleLoading,
  selectPeopleError,
  selectPeoplePage,
  selectPeopleCompanyFilter,
} from '@/features/people/peopleSelectors';

const PER_PAGE = 9;

export default function PeopleListingPage() {
  const dispatch = useAppDispatch();
  const people = useAppSelector(selectPeopleList);
  const isLoading = useAppSelector(selectPeopleLoading);
  const error = useAppSelector(selectPeopleError);
  const currentPage = useAppSelector(selectPeoplePage);
  const companyFilter = useAppSelector(selectPeopleCompanyFilter);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [perPage, setPerPage] = useState(PER_PAGE);

  useEffect(() => {
    dispatch(loadPeople());
  }, [dispatch]);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(
        people
          .map((person) => person.department && person.department.toString().trim())
          .filter(Boolean)
      )
    );
  }, [people]);

  const locationOptions = useMemo(() => {
    return Array.from(
      new Set(
        people
          .map((person) => person.location && person.location.toString().trim())
          .filter(Boolean)
      )
    );
  }, [people]);

  const filteredPeople = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = people.filter((person) => {
      const matchesCompany =
        !companyFilter ||
        person.company?.toLowerCase() === companyFilter.toLowerCase();
      if (!matchesCompany) return false;
      if (departmentFilter && person.department !== departmentFilter) return false;
      if (locationFilter && person.location !== locationFilter) return false;
      if (!term) return true;
      return [person.name, person.title, person.department, person.location]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });

    const sorted = [...filtered];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'join-newest') {
      sorted.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    } else if (sortBy === 'join-oldest') {
      sorted.sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));
    }

    return sorted;
  }, [people, searchTerm, companyFilter, departmentFilter, locationFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / perPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      dispatch(setPage(totalPages));
    }
  }, [currentPage, dispatch, totalPages]);

  const pageStart = (currentPage - 1) * perPage;
  const pagedPeople = filteredPeople.slice(pageStart, pageStart + perPage);
  const selectedEmployee = people.find((person) => person.id === selectedEmployeeId) || null;
  const isCompact = Boolean(selectedEmployee);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setPage(page));
  };

  const handlePerPageChange = (n) => {
    const value = Number(n) || PER_PAGE;
    setPerPage(value);
    dispatch(setPage(1));
  };

  const handleSelect = (personId) => {
    setSelectedEmployeeId((current) => (current === personId ? null : personId));
  };

  const employeesBgStyle = {
    backgroundImage: 'url(/feedback-form-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'right center',
    backgroundRepeat: 'no-repeat',
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#fafafa]"
        style={employeesBgStyle}
      >
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
              onClick={() => {
                dispatch(setCompanyFilter('AIA'));
                setDepartmentFilter('');
                setLocationFilter('');
              }}
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
              onClick={() => {
                dispatch(setCompanyFilter('VEGA'));
                setDepartmentFilter('');
                setLocationFilter('');
              }}
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
          onSearchChange={(val) => { setSearchTerm(val); dispatch(setPage(1)); }}
          showDate={false}
          // date not used for people
          selects={[
            { value: sortBy, onChange: (v) => { setSortBy(v); dispatch(setPage(1)); }, options: ['', 'name-asc', 'name-desc', 'join-newest', 'join-oldest'], placeholder: 'Sort By' },
            { value: departmentFilter, onChange: (v) => { setDepartmentFilter(v); dispatch(setPage(1)); }, options: departmentOptions, placeholder: 'Department' },
            { value: locationFilter, onChange: (v) => { setLocationFilter(v); dispatch(setPage(1)); }, options: locationOptions, placeholder: 'Location' },
          ]}
        />
      </PageHeader>

      <PageSection className="pt-0">
        {error ? (
          <div className="text-center py-20">
            <p className="text-body text-muted-foreground">{error}</p>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-body text-muted-foreground">No employees found</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              <PeopleGrid
                pagedPeople={pagedPeople}
                selectedEmployeeId={selectedEmployeeId}
                handleSelect={handleSelect}
                isCompact={isCompact}
              />

              {selectedEmployee ? (
                <PeopleDetail selectedEmployee={selectedEmployee} onClose={() => setSelectedEmployeeId(null)} />
              ) : null}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showSummary
              totalCount={filteredPeople.length}
              perPageOptions={[3, 6, 9, 12, 15]}
              perPage={perPage}
              onPerPageChange={handlePerPageChange}
              className="mt-6"
            />
          </>
        )}
      </PageSection>
    </div>
  );
}
