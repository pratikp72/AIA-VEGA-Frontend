"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import GalleryGrid from '@/features/gallery/components/GalleryGrid';
import Filters from '@/components/common/Filters';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadGalleryByFilters, setPage as setGalleryPage } from '@/features/gallery/gallerySlice';
import {
  selectGalleryItems,
  selectGalleryLoading,
  selectGalleryError,
  selectGalleryCurrentPage,
  selectGalleryTotalPages,
} from '@/features/gallery/gallerySelectors';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

const SORT_BY_OPTIONS = [
  { label: 'Latest', value: 'Newest' },
  { label: 'Oldest', value: 'Oldest' },
  { label: 'Title A-Z', value: 'Title A-Z' },
  { label: 'Title Z-A', value: 'Title Z-A' },
];

const TYPE_OPTIONS = [
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
];

function formatDateForApi(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value?.toISOString) return value.toISOString().slice(0, 10);
  return '';
}

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = useAppSelector(selectGalleryItems);
  const isLoading = useAppSelector(selectGalleryLoading);
  const error = useAppSelector(selectGalleryError);
  const currentPage = useAppSelector(selectGalleryCurrentPage);
  const totalPages = useAppSelector(selectGalleryTotalPages);

  const [companyFilter, setCompanyFilter] = useState(searchParams.get('company') || 'AIA');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchDebounced, setSearchDebounced] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
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

  useEffect(() => {
    dispatch(setGalleryPage(1));
    const params = { page: 1, pageSize: PAGE_SIZE };
    if (companyFilter) params.company = companyFilter;
    if (type) params.type = type;
    if (sortBy) params.sortBy = sortBy;
    if (searchDebounced?.trim()) params.search = searchDebounced.trim();
    if (date) params.date = formatDateForApi(date);
    dispatch(loadGalleryByFilters(params));
  }, [companyFilter, type, sortBy, date, searchDebounced, dispatch]);

  const handleLoadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    const params = { page: nextPage, pageSize: PAGE_SIZE, append: true };
    if (companyFilter) params.company = companyFilter;
    if (type) params.type = type;
    if (sortBy) params.sortBy = sortBy;
    if (searchDebounced?.trim()) params.search = searchDebounced.trim();
    if (date) params.date = formatDateForApi(date);
    dispatch(loadGalleryByFilters(params));
  }, [dispatch, currentPage, companyFilter, type, sortBy, searchDebounced, date]);

  const sentinelRef = useInfiniteScroll({
    isLoading,
    currentPage,
    totalPages,
    onLoadMore: handleLoadMore,
  });

  const galleryBgStyle = {
    backgroundImage: 'url(/gallery-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // ── Sync filter/sort state → URL search params (persistence across refresh) ──
  const isFirstUrlSync = useRef(true);
  useEffect(() => {
    if (isFirstUrlSync.current) {
      isFirstUrlSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (companyFilter && companyFilter !== 'AIA') params.set('company', companyFilter);
    if (searchDebounced?.trim()) params.set('search', searchDebounced.trim());
    if (sortBy) params.set('sortBy', sortBy);
    if (date) {
      const dateStr = typeof date === 'string' ? date : formatDateForApi(date);
      if (dateStr) params.set('date', dateStr);
    }
    if (type) params.set('type', type);
    const qs = params.toString();
    const newUrl = `${pathname}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(null, '', newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilter, searchDebounced, sortBy, date, type, pathname]);

  return (
    <div className="min-h-screen bg-[#fafafa]" style={galleryBgStyle}>
      <PageHeader
        title="Gallery"
        breadcrumbs={[{ label: 'Gallery' }]}
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
        right={
          <div className="flex items-center rounded-xl border border-primary">
            <button
              type="button"
              onClick={() => setCompanyFilter('AIA')}
              className={companyFilter === 'AIA'
                ? 'h-8.5 px-4 text-small font-medium rounded-r-none rounded-l-xl bg-primary text-white'
                : 'h-8.5 px-4 text-small font-medium rounded-r-none rounded-l-xl bg-white text-primary'}
            >
              AIA
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter('VEGA')}
              className={companyFilter === 'VEGA'
                ? 'h-8.5 px-4 text-small font-medium rounded-l-none rounded-r-xl bg-primary text-white'
                : 'h-8.5 px-4 text-small font-medium rounded-l-none rounded-r-xl bg-white text-primary'}
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
              { value: sortBy, onChange: (v) => setSortBy(v), options: SORT_BY_OPTIONS, placeholder: 'Sort By', variant: 'filter' },
              { value: type, onChange: (v) => setType(v), options: TYPE_OPTIONS, placeholder: 'Type', variant: 'filter' },
            ]}
          >
            {(
              search ||
              date ||
              sortBy ||
              type
            ) && (
              <Button
                type="button"
                className="h-12 px-4 rounded-[12px] border border-gray-100 bg-white text-primary font-medium text-base shadow-none hover:bg-gray-100"
                onClick={() => {
                  setSearch('');
                  setDate('');
                  setSortBy('');
                  setType('');
                }}
              >
                Reset filters
              </Button>
            )}
          </Filters>
        </div>
      </PageHeader>

      <main>
        <PageSection className="pt-7">
          {isLoading && currentPage === 1 ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground mb-4">{error}</p>
              <button
                type="button"
                onClick={() => dispatch(loadGalleryByFilters({
                  page: 1,
                  pageSize: PAGE_SIZE,
                  company: companyFilter,
                  type: type || undefined,
                  sortBy: sortBy || 'newest',
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
            <>
              <GalleryGrid items={items ?? []} />
              {/* Sentinel — triggers next page load when scrolled into view */}
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {isLoading && <Loader size="sm" />}
              </div>
            </>
          )}
        </PageSection>
      </main>
    </div>
  );
}
