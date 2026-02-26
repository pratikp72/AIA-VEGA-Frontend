'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import SurfaceCard from '@/components/common/SurfaceCard';
import { fetchNewsById } from '@/features/news/newsAPI';
import { loadAllNews } from '@/features/news/newsSlice';
import { selectNewsList } from '@/features/news/newsSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Loader from '@/components/common/Loader';
import MarkdownIt from 'markdown-it';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id;
  const md = new MarkdownIt({ html: true });
  const dispatch = useAppDispatch();
  const newsList = useAppSelector(selectNewsList);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const latestNews = useMemo(() => {
    return (newsList || [])
      .filter((n) => (n.documentId ?? String(n.id)) !== String(id))
      .slice(0, 8);
  }, [newsList, id]);

  useEffect(() => {
    dispatch(loadAllNews());
  }, [dispatch]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchNewsById(id)
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .catch(() => {
        if (!cancelled) setArticle(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-body text-gray-600">Article not found.</p>
        <Link href="/news" className="text-primary hover:underline">Back to News</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title={null}
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'News', href: '/news' },
        ]}
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

      {/* Main + Sidebar */}
      <main>
        <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2 space-y-6">
            <h1 className="text-h1 text-gray-900">
              {article.title}
            </h1>
            <div className="relative w-full h-[440px] overflow-hidden rounded-xl bg-gray-100">
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="prose prose-gray max-w-none text-gray-600">
              <p dangerouslySetInnerHTML={{ __html: md.render(article.description || '') }} />
            </div>
          </article>

          {/* Latest News Sidebar */}
          <aside className="lg:col-span-1 lg:mt-14">
            <SurfaceCard className="overflow-hidden">
              <div className="px-4 pt-0 pb-0">
                <h2 className="text-h2 text-gray-900">Latest News</h2>
              </div>
              <ul className="divide-y divide-gray-300 px-4">
                {latestNews.map((item) => (
                  <li key={item.id}>
                    <Link href={`/news/${item.documentId ?? item.id}`} className="block">
                      <div className="flex gap-3 py-3">
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <h3 className="text-h3 text-gray-900 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-body text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: md.render(item.description || '') }} />
                          <p className="text-small text-gray-400">
                            {(() => {
                              const date = item.createdAt || item.date;
                              if (!date) return '';
                              const d = new Date(date);
                              return d.toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                              });
                            })()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </aside>
        </div>
        </PageSection>
      </main>
    </div>
  );
}
