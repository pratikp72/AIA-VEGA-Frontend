'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadAllNews, setPage } from '@/features/news/newsSlice';
import {
  selectNewsList,
  selectCurrentPage,
  selectTotalPages,
  selectNewsLoading,
} from '@/features/news/newsSelectors';

import NewsCard from './NewsCard';
import Pagination from '@/components/common/Pagination';
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
    dispatch(loadAllNews({ page: currentPage, limit: NEWS_PER_PAGE }));
  }, [dispatch, currentPage]);

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

            {/* Pagination - always show when there are items, ensure visible */}
            {newsList.length > 0 && (
              <Pagination
                className="mt-8 mb-8"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
        </PageSection>
      </main>
    </div>
  );
}