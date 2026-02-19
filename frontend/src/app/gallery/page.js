"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import GalleryGrid from '@/features/gallery/components/GalleryGrid';
import Filters from '@/components/common/Filters';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadGallery, setPage } from '@/features/gallery/gallerySlice';
import {
  selectGalleryItems,
  selectGalleryLoading,
  selectGalleryError,
  selectGalleryCurrentPage,
  selectGalleryTotalPages,
} from '@/features/gallery/gallerySelectors';

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectGalleryItems);
  const isLoading = useAppSelector(selectGalleryLoading);
  const error = useAppSelector(selectGalleryError);
  const currentPage = useAppSelector(selectGalleryCurrentPage);
  const totalPages = useAppSelector(selectGalleryTotalPages);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [companyFilter, setCompanyFilter] = useState('AIA');

  const PER_PAGE = 12;

  useEffect(() => {
    dispatch(loadGallery({ page: 1, limit: PER_PAGE, append: false }));
    dispatch(setPage(1));
  }, [dispatch]);

  const sentinelRef = useRef(null);

  const loadNext = useCallback(() => {
    if (isLoading) return;
    if (currentPage >= totalPages) return;
    const next = currentPage + 1;
    dispatch(loadGallery({ page: next, limit: PER_PAGE, append: true }));
    dispatch(setPage(next));
  }, [isLoading, currentPage, totalPages, dispatch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadNext();
        });
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext]);

  const filtered = (items || []).filter((it) => {
    if (companyFilter && it.company && it.company !== companyFilter) return false;
    if (type && it.type !== type) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(`${it.title} ${it.type}`.toLowerCase().includes(s))) return false;
    }
    if (date) {
      // match exact date (compare date parts only)
      try {
        const sel = new Date(date).toDateString();
        if (new Date(it.date).toDateString() !== sel) return false;
      } catch (e) {
        // fallback: if parsing fails, don't filter
      }
    }
    return true;
  });

  const sorted = (() => {
    if (!sortBy) return filtered;
    const arr = [...filtered];
    if (sortBy === 'newest') return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === 'oldest') return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortBy === 'title-asc') return arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'title-desc') return arr.sort((a, b) => b.title.localeCompare(a.title));
    return arr;
  })();

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
              className={companyFilter === 'AIA' ? 'h-[34px] px-4 text-small font-medium rounded-r-none rounded-l-[8px] bg-primary text-white' : 'h-[34px] px-4 text-small font-medium rounded-r-none rounded-l-[8px] bg-white text-primary'}
            >
              AIA
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter('VEGA')}
              className={companyFilter === 'VEGA' ? 'h-[34px] px-4 text-small font-medium rounded-l-none rounded-r-[8px] bg-primary text-white' : 'h-[34px] px-4 text-small font-medium rounded-l-none rounded-r-[8px] bg-white text-primary'}
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
              { value: sortBy, onChange: (v) => setSortBy(v), options: ['', 'newest', 'oldest', 'title-asc', 'title-desc'], placeholder: 'Sort By' },
              { value: type, onChange: (v) => setType(v), options: ['', 'Image', 'Video'], placeholder: 'Type' },
            ]}
          />
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
              <p className="text-body text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              {sorted.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-body text-muted-foreground">{date ? 'No data for that date' : 'No items found'}</p>
                </div>
              ) : (
                <>
                  <GalleryGrid items={sorted} />
                  <div ref={sentinelRef} className="h-4" />
                </>
              )}
            </>
          )}
        </PageSection>
      </main>
    </div>
  );
}
