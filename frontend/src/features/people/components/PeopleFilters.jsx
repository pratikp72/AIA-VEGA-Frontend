"use client";

import Filters from '@/components/common/Filters';

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
            { value: sortBy, onChange: onSortChange, options: ['', 'name-asc', 'name-desc', 'join-newest', 'join-oldest'], placeholder: 'Sort By' },
            { value: departmentFilter, onChange: onDepartmentChange, options: departmentOptions, placeholder: 'Department' },
            { value: locationFilter, onChange: onLocationChange, options: locationOptions, placeholder: 'Location' },
          ]}
        />
      </div>
    </>
  );
}
