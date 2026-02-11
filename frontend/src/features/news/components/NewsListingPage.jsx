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
import NewsPagination from './NewsPagination';
import Loader from '@/components/common/Loader';
import PageContainer from '@/components/layout/PageContainer';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';

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
      <div className="bg-card">
        <PageContainer className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-medium mb-2">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-dark font-medium">News</span>
            </div>
            {/* Title */}
            <h1 className="text-h1 text-gray-dark">News</h1>
          </div>
          {/* Back to Home - right side */}
          <Link
            href="/home"
            className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:underline shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </PageContainer>
      </div>

      {/* Content */}
      <main>
        <PageContainer className="py-3">
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
              <div className="mt-8 mb-8">
                <NewsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
        </PageContainer>
      </main>
    </div>
  );
}