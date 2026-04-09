"use client";

import Filters from '@/components/common/Filters';

const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'Name-asc' },
  { label: 'Name (Z-A)', value: 'Name-desc' },
  { label: 'Join Date (Newest)', value: 'Join-newest' },
  { label: 'Join Date (Oldest)', value: 'Join-oldest' },
];

export default function PeopleFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  departmentFilter,
  onDepartmentChange,
  locationFilter,
  onLocationChange,
  departmentOptions = [],
  locationOptions = [],
}) {
  return (
    <>
      <p className="text-body text-muted-foreground">Find and connect with colleagues across the organization</p>
      <div className="mt-4">
        <Filters
          search={searchTerm}
          onSearchChange={onSearchChange}
          showDate={false}
          selects={[
            {
              value: sortBy,
              onChange: onSortChange,
              options: SORT_OPTIONS,
              placeholder: 'Sort By',
              variant: 'filter',
            },
            {
              value: departmentFilter,
              onChange: onDepartmentChange,
              options: departmentOptions,
              placeholder: 'Department',
              variant: 'filter',
            },
            {
              value: locationFilter,
              onChange: onLocationChange,
              options: locationOptions,
              placeholder: 'Location',
              variant: 'filter',
            },
          ]}
        />
      </div>
    </>
  );
}
