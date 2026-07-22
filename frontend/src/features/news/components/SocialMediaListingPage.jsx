'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import NewsFilters from '@/features/news/components/NewsFilters';
import SocialMediaGrid from './SocialMediaGrid';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSocialMedias, setPage as setSocialMediaPage } from '@/features/news/socialMediaSlice';
import {
  selectSocialMediaList,
  selectSocialMediaLoading,
  selectSocialMediaError,
  selectSocialMediaCurrentPage,
  selectSocialMediaTotalPages,
} from '@/features/news/socialMediaSelectors';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const PAGE_SIZE = 24;

export default function SocialMediaListingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const list = useAppSelector(selectSocialMediaList);
  const isLoading = useAppSelector(selectSocialMediaLoading);
  const error = useAppSelector(selectSocialMediaError);
  const currentPage = useAppSelector(selectSocialMediaCurrentPage);
  const totalPages = useAppSelector(selectSocialMediaTotalPages);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSocialMediaPage(1));
      dispatch(loadSocialMedias({ page: 1, pageSize: PAGE_SIZE, search, append: false }));
    }, search ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [dispatch, search]);

  const handleLoadMore = useCallback(() => {
    const next = currentPage + 1;
    dispatch(loadSocialMedias({ page: next, pageSize: PAGE_SIZE, search, append: true }));
    dispatch(setSocialMediaPage(next));
  }, [dispatch, currentPage, search]);

  const sentinelRef = useInfiniteScroll({
    isLoading,
    currentPage,
    totalPages,
    onLoadMore: handleLoadMore,
  });

  const isFirstUrlSync = useRef(true);
  const urlSyncTimerRef = useRef(null);
  useEffect(() => {
    if (isFirstUrlSync.current) {
      isFirstUrlSync.current = false;
      return;
    }
    if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
    urlSyncTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (search?.trim()) params.set('search', search.trim());
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    }, 300);
    return () => {
      if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
    };
  }, [search, pathname, router]);

  const newsBgStyle = {
    backgroundImage: 'url(/feedback-form-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'right center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-background" style={newsBgStyle}>
      <PageHeader
        title="News"
        breadcrumbs={[{ label: 'News' }, { label: 'Social Media' }]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      >
        <p className="text-body text-muted-foreground">Company news and social media updates.</p>
        <NewsFilters
          tab="social-media"
          onTabChange={(val) => {
            if (val === 'news') router.push('/news');
          }}
          search={search}
          onSearchChange={setSearch}
          showSearch
        />
      </PageHeader>

      <main>
        <PageSection>
          {isLoading && currentPage === 1 ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{error}</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-gray-medium">
                {search ? 'No social media posts found for the selected filters' : 'No social media posts found'}
              </p>
            </div>
          ) : (
            <>
              <SocialMediaGrid items={list} />
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
