"use client";

import { useEffect, useState, useRef } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import GalleryGrid from '@/features/gallery/components/GalleryGrid';
import Filters from '@/components/common/Filters';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadGalleryByFilters } from '@/features/gallery/gallerySlice';
import {
  selectGalleryItems,
  selectGalleryLoading,
  selectGalleryError,
} from '@/features/gallery/gallerySelectors';

const SEARCH_DEBOUNCE_MS = 300;

// Sort By: display label -> API value
const SORT_BY_MAP = { 'Newest': 'newest', 'Oldest': 'oldest', 'Title A–Z': 'title-asc', 'Title Z–A': 'title-desc' };
const SORT_BY_OPTIONS = ['', 'Newest', 'Oldest', 'Title A–Z', 'Title Z–A'];

// Type: display -> API value (image | video)
const TYPE_OPTIONS = ['', 'Image', 'Video'];

function formatDateForApi(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value?.toISOString) return value.toISOString().slice(0, 10);
  return '';
}

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectGalleryItems);
  const isLoading = useAppSelector(selectGalleryLoading);
  const error = useAppSelector(selectGalleryError);

  const [companyFilter, setCompanyFilter] = useState('AIA');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const searchDebounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchDebounced(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  // Fetch from /by-filters when filters change — backend handles all filtering
  useEffect(() => {
    const params = {};
    if (companyFilter) params.company = companyFilter;
    if (type) params.type = type.toLowerCase();
    if (sortBy) {
      params.sortBy = SORT_BY_MAP[sortBy] ?? sortBy;
    }
    if (searchDebounced?.trim()) params.search = searchDebounced.trim();
    if (date) params.date = formatDateForApi(date);
    dispatch(loadGalleryByFilters(params));
  }, [companyFilter, type, sortBy, date, searchDebounced, dispatch]);

  const galleryBgStyle = {
    backgroundImage: 'url(/gallery-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={galleryBgStyle}>
      <PageHeader
        title="Gallery"
        breadcrumbs={[{ label: 'Gallery' }]}
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
        right={
          <div className="flex items-center rounded-[8px] border border-primary">
            <button
              type="button"
              onClick={() => setCompanyFilter('AIA')}
              className={companyFilter === 'AIA'
                ? 'h-[34px] px-4 text-small font-medium rounded-r-none rounded-l-[8px] bg-primary text-white'
                : 'h-[34px] px-4 text-small font-medium rounded-r-none rounded-l-[8px] bg-white text-primary'}
            >
              AIA
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter('VEGA')}
              className={companyFilter === 'VEGA'
                ? 'h-[34px] px-4 text-small font-medium rounded-l-none rounded-r-[8px] bg-primary text-white'
                : 'h-[34px] px-4 text-small font-medium rounded-l-none rounded-r-[8px] bg-white text-primary'}
            >
              VEGA
            </button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">Explore company's collection of images and videos</p>
        <div className="mt-4">
          <Filters
            search={search}
            onSearchChange={(v) => setSearch(v)}
            date={date}
            onDateChange={(v) => setDate(v)}
            selects={[
              { value: sortBy, onChange: (v) => setSortBy(v), options: SORT_BY_OPTIONS, placeholder: 'Sort By' },
              { value: type, onChange: (v) => setType(v), options: TYPE_OPTIONS, placeholder: 'Type' },
            ]}
          >
            <button
              type="button"
              className="ml-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
              onClick={() => {
                setSearch('');
                setDate('');
                setSortBy('');
                setType('');
              }}
            >
              Reset Filters
            </button>
          </Filters>
        </div>
      </PageHeader>

      <main>
        <PageSection className="pt-7">
          {isLoading && (!items || items.length === 0) ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground mb-4">{error}</p>
              <button
                type="button"
                onClick={() => dispatch(loadGalleryByFilters({
                  company: companyFilter,
                  type: type ? type.toLowerCase() : undefined,
                  sortBy: SORT_BY_MAP[sortBy] ?? sortBy ?? 'newest',
                  search: searchDebounced?.trim(),
                  date: date ? formatDateForApi(date) : undefined,
                }))}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : (items?.length ?? 0) === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">No items found</p>
            </div>
          ) : (
            <GalleryGrid items={items ?? []} />
          )}
        </PageSection>
      </main>
    </div>
  );
}
