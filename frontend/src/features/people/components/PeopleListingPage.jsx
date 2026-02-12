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

function formatJoinDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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

  useEffect(() => {
    dispatch(loadPeople());
  }, [dispatch]);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(people.map((person) => person.department).filter(Boolean))
    );
  }, [people]);

  const locationOptions = useMemo(() => {
    return Array.from(
      new Set(people.map((person) => person.location).filter(Boolean))
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

  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      dispatch(setPage(totalPages));
    }
  }, [currentPage, dispatch, totalPages]);

  const pageStart = (currentPage - 1) * PER_PAGE;
  const pagedPeople = filteredPeople.slice(pageStart, pageStart + PER_PAGE);
  const selectedEmployee = people.find((person) => person.id === selectedEmployeeId) || null;
  const isCompact = Boolean(selectedEmployee);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setPage(page));
  };

  const handleSelect = (personId) => {
    setSelectedEmployeeId((current) => (current === personId ? null : personId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        title="Employees"
        breadcrumbs={[{ label: 'Employee Directory' }]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-xl px-xl"
        right={
          <div className="flex items-center rounded-[8px] border border-primary">
            <Button
              type="button"
              onClick={() => dispatch(setCompanyFilter('AIA'))}
              className={cn(
                'h-[34px] px-4 text-small font-medium rounded-r-none rounded-l-[8px] shadow-none',
                companyFilter === 'AIA'
                  ? 'bg-primary text-white hover:bg-primary'
                  : 'bg-white text-primary hover:bg-white'
              )}
            >
              AIA
            </Button>
            <Button
              type="button"
              onClick={() => dispatch(setCompanyFilter('VEGA'))}
              className={cn(
                'h-[34px] px-4 text-small font-medium rounded-l-none rounded-r-[8px] shadow-none',
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
        <p className="text-body text-muted-foreground">
          Find and connect with colleagues across the organization
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[repeat(4,232px)] lg:justify-start">
          <div className="relative w-full lg:w-[232px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4]" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                dispatch(setPage(1));
              }}
              placeholder="Search"
              className="h-12 w-full rounded-[12px] border border-gray-200 bg-white px-4 pl-10 text-muted-foreground placeholder:text-[#B3B3B3] shadow-[0_0_6px_rgba(0,0,0,0.09)]"
            />
          </div>
          <div className="group relative w-full lg:w-[232px]">
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                dispatch(setPage(1));
              }}
              className={cn(
                'h-12 w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-small shadow-[0_0_6px_rgba(0,0,0,0.09)] hover:bg-white focus:bg-white active:bg-white focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                sortBy ? 'text-black' : 'text-[#C4C4C4]'
              )}
            >
              <option value="">Sort By</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="join-newest">Join Date (Newest)</option>
              <option value="join-oldest">Join Date (Oldest)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4] transition-transform rotate-0 group-focus-within:rotate-180" />
          </div>
          <div className="group relative w-full lg:w-[232px]">
            <select
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(event.target.value);
                dispatch(setPage(1));
              }}
              className={cn(
                'h-12 w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-small shadow-[0_0_6px_rgba(0,0,0,0.09)] hover:bg-white focus:bg-white active:bg-white focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                departmentFilter ? 'text-black' : 'text-[#C4C4C4]'
              )}
            >
              <option value="">Department</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4] transition-transform rotate-0 group-focus-within:rotate-180" />
          </div>
          <div className="group relative w-full lg:w-[232px]">
            <select
              value={locationFilter}
              onChange={(event) => {
                setLocationFilter(event.target.value);
                dispatch(setPage(1));
              }}
              className={cn(
                'h-12 w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-small shadow-[0_0_6px_rgba(0,0,0,0.09)] hover:bg-white focus:bg-white active:bg-white focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                locationFilter ? 'text-black' : 'text-[#C4C4C4]'
              )}
            >
              <option value="">Location</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4C4C4] transition-transform rotate-0 group-focus-within:rotate-180" />
          </div>
        </div>
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
              <div
                className={cn(
                  'grid w-full gap-6',
                  isCompact
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                )}
              >
                {pagedPeople.map((person) => (
                  <SurfaceCard
                    key={person.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(person.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelect(person.id);
                      }
                    }}
                    className={cn(
                      'w-full cursor-pointer border border-gray-200 bg-white p-4 h-[236px] flex flex-col justify-between transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      selectedEmployeeId === person.id ? 'ring-2 ring-primary' : ''
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className={cn(
                            'rounded-full object-cover',
                            isCompact ? 'h-12 w-12' : 'h-12 w-12'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-h3 text-gray-dark truncate">{person.name}</h3>
                          {person.isNew ? (
                            <Badge className="bg-[#F4E2FF] px-2 py-0.5 text-[10px] text-primary-purple">
                              New Joinee
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-small text-primary-purple font-medium">
                          {person.title}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 text-body text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="truncate">{person.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{person.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="truncate">Joined {formatJoinDate(person.joinDate)}</span>
                      </div>
                    </div>
                    <Button className="h-10 w-full rounded-full bg-primary text-white" size="default">
                      View Profile
                    </Button>
                  </SurfaceCard>
                ))}
              </div>

              {selectedEmployee ? (
                <SurfaceCard className="w-full border border-gray-200 bg-white p-4 xl:sticky xl:top-6 xl:max-w-[340px] xl:self-start">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[22px] font-semibold leading-[28px]">
                        {selectedEmployee.name}
                      </h3>
                      <p className="mt-1 text-small text-muted-foreground">{selectedEmployee.title}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelectedEmployeeId(null)}
                      aria-label="Close employee details"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="h-px w-full bg-gray-200" />

                  <div className="mt-2 space-y-4  text-gray-200 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{selectedEmployee.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedEmployee.yearsAtCompany} Years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEmployee.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate text-primary-purple">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-primary-purple">{selectedEmployee.phone}</span>
                    </div>
                  </div>
                </SurfaceCard>
              ) : null}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showSummary
              totalCount={filteredPeople.length}
              perPageLabel={`${PER_PAGE} per page`}
              className="mt-6"
            />
          </>
        )}
      </PageSection>
    </div>
  );
}
