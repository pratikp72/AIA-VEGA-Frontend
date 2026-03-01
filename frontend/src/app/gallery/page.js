"use client";

import { useEffect, useState, useMemo } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import GalleryGrid from '@/features/gallery/components/GalleryGrid';
import Filters from '@/components/common/Filters';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadGallery } from '@/features/gallery/gallerySlice';
import {
  selectGalleryItems,
  selectGalleryLoading,
  selectGalleryError,
} from '@/features/gallery/gallerySelectors';

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectGalleryItems);
  const isLoading = useAppSelector(selectGalleryLoading);
  const error = useAppSelector(selectGalleryError);

  const [companyFilter, setCompanyFilter] = useState('AIA');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');

  // Load all items once on mount — client-side filtering handles the rest
  useEffect(() => {
    dispatch(loadGallery({ page: 1, limit: 100, append: false }));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const result = (items || []).filter((it) => {
      // Company filter — only apply when item has a company set; unlinked items show in all tabs
      if (companyFilter && it.company && it.company.toLowerCase() !== companyFilter.toLowerCase()) return false;

      // Type filter
      if (type && it.type !== type) return false;

      // Search filter
      if (search) {
        const s = search.toLowerCase();
        if (!(`${it.title} ${it.type}`.toLowerCase().includes(s))) return false;
      }

      // Date filter
      if (date) {
        try {
          const sel = new Date(date).toDateString();
          if (new Date(it.date).toDateString() !== sel) return false;
        } catch (e) {
          // ignore parse errors
        }
      }

      return true;
    });

    if (!sortBy) return result;
    const arr = [...result];
    if (sortBy === 'newest') return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === 'oldest') return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortBy === 'title-asc') return arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'title-desc') return arr.sort((a, b) => b.title.localeCompare(a.title));
    return arr;
  }, [items, companyFilter, type, search, date, sortBy]);

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
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">No items found</p>
            </div>
          ) : (
            <GalleryGrid items={filtered} />
          )}
        </PageSection>
      </main>
    </div>
  );
}
