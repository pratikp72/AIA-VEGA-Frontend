'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadAllNews, loadNewsByCategory } from '@/features/news/newsSlice';
import { selectNewsList, selectNewsLoading } from '@/features/news/newsSelectors';
import { fetchNewsCategories } from '@/features/news/newsAPI';
import NewsCard from './NewsCard';
import Loader from '@/components/common/Loader';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Select from '@/components/ui/select';

export default function NewsListingPage() {
  const dispatch = useAppDispatch();
  const rawNewsList = useAppSelector(selectNewsList);
  const isLoading = useAppSelector(selectNewsLoading);

  // Only show news whose publish date has already arrived
  const newsList = rawNewsList.filter((n) => {
    const pub = n.publish_date || n.date;
    if (!pub) return true; // no date → show it
    return new Date(pub) <= new Date();
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    fetchNewsCategories()
      .then((list) => setCategories(list || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All Categories' || !selectedCategory) {
      dispatch(loadAllNews());
    } else {
      dispatch(loadNewsByCategory(selectedCategory));
    }
  }, [dispatch, selectedCategory]);

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value === '' ? 'All Categories' : value);
  }, []);

  const categoryOptions = [...categories.map((c) => c.name)];

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
        breadcrumbs={[{ label: 'Home', href: '/home' }, { label: 'News' }]}
        right={
          <div className="w-[200px]">
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="All Categories"
            />
          </div>
        }
      />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {newsList.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          )}
        </PageSection>
      </main>
    </div>
  );
}
