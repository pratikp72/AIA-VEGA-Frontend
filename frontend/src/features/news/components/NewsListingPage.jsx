'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadAllNews, setPage } from '@/features/news/newsSlice';
import {
  selectNewsList,
  selectCurrentPage,
  selectTotalPages,
  selectNewsLoading,
} from '@/features/news/newsSelectors';

import NewsCard from './NewsCard';
// Pagination removed in favor of infinite scroll
import Loader from '@/components/common/Loader';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const NEWS_PER_PAGE = 6;

export default function NewsListingPage() {
  const dispatch = useAppDispatch();

  const newsList = useAppSelector(selectNewsList);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  const isLoading = useAppSelector(selectNewsLoading);

  useEffect(() => {
    // initial load - replace
    dispatch(loadAllNews({ page: 1, limit: NEWS_PER_PAGE, append: false }));
    dispatch(setPage(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const sentinelRef = useRef(null);

  const loadNext = useCallback(() => {
    if (isLoading) return;
    if (currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    dispatch(loadAllNews({ page: nextPage, limit: NEWS_PER_PAGE, append: true }));
    dispatch(setPage(nextPage));
  }, [isLoading, currentPage, totalPages, dispatch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadNext();
          }
        });
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext]);

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="News"
        breadcrumbs={[{ label: 'Home', href: '/home' }, { label: 'News' }]}
        right={(
          <Link
            href="/home"
            className="flex items-center gap-2 text-small font-medium text-gray-medium hover:text-gray-dark hover:underline shrink-0"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Link>
        )}
      />

      {/* Content */}
      <main>
        <PageSection>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-body text-gray-medium">No news found</p>
          </div>
        ) : (
          <>
            {/* News Grid - items-stretch so all cards same height */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {newsList.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-6" />
            {/* optional loader at bottom while fetching next page */}
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader />
              </div>
            )}
          </>
        )}
        </PageSection>
      </main>
    </div>
  );
}