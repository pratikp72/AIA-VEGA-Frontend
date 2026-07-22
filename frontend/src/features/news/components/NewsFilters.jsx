'use client';

import Filters from '@/components/common/Filters';

export default function NewsFilters({
  tab,
  onTabChange,
  search,
  onSearchChange,
  showSearch = false,
  selects = [],
}) {
  return (
    <Filters
      tab={tab}
      onTabChange={onTabChange}
      tabs={[
        { key: 'news', label: 'News' },
        { key: 'social-media', label: 'Social Media' },
      ]}
      search={search}
      onSearchChange={onSearchChange}
      showDate={false}
      showSearch={showSearch}
      selects={selects}
    />
  );
}
