'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { fetchNewsById, fetchAllNews } from '@/features/news/newsAPI';
import Loader from '@/components/common/Loader';
import PageContainer from '@/components/layout/PageContainer';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [article, setArticle] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAllNews(1, 12).then((res) => {
      const list = (res.news || []).filter((n) => n.id !== parseInt(id, 10)).slice(0, 8);
      setLatestNews(list);
    });
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
        <p className="text-gray-600">Article not found.</p>
        <Link href="/news" className="text-primary hover:underline">Back to News</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card">
        <PageContainer className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1">
            <Link href="/home" className="hover:underline">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/news" className="hover:underline">News</Link>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:underline shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </PageContainer>
      </div>

      {/* Main + Sidebar */}
      <main>
        <PageContainer className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article */}
          <article className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {article.title}
            </h1>
            <div className="relative w-full aspect-video overflow-hidden rounded-xl">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-medium text-gray-700">
              {article.description}
            </p>
            <div className="prose prose-gray max-w-none text-gray-600">
              <p>
                {article.description}
              </p>
              <p>
                We are committed to keeping our employees and stakeholders informed. For more updates, visit the News section regularly.
              </p>
            </div>
          </article>

          {/* Latest News Sidebar */}
          <aside className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest News</h2>
            <ul className="space-y-4">
              {latestNews.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/news/${item.id}`}
                    className="flex gap-3 group hover:opacity-90"
                  >
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:underline line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        </PageContainer>
      </main>
    </div>
  );
}
