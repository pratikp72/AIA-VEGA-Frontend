"use client";

import Filters from '@/components/common/Filters';

export default function PolicyFilters({
  tab,
  onTabChange,
  search,
  onSearchChange,
  date,
  onDateChange,
}) {
  const isForms = tab === 'forms';

  return (
    <Filters
      tab={tab}
      onTabChange={onTabChange}
      tabs={[{ key: 'policies', label: 'Policies' }, { key: 'forms-templates', label: 'Forms & Templates' }]}
      search={search}
      onSearchChange={onSearchChange}
      date={date}
      onDateChange={onDateChange}
      showDate={!isForms}
      showSearch={!isForms}
    />
  );
}
