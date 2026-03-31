'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import SurfaceCard from '@/components/common/SurfaceCard';
import { fetchNewsById, likeNews, unlikeNews, fetchNewsLikesState } from '@/features/news/newsAPI';
import { loadAllNews } from '@/features/news/newsSlice';
import { selectNewsList } from '@/features/news/newsSelectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUserId } from '@/lib/auth';
import Loader from '@/components/common/Loader';
import MarkdownIt from 'markdown-it';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id;
  const md = new MarkdownIt({ html: true });
  const sidebarMd = new MarkdownIt({ html: true }).disable(['image']);
  const dispatch = useAppDispatch();
  const newsList = useAppSelector(selectNewsList);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const userId = getCurrentUserId();

  // Check if current user is in likes (handles API: objects with id/documentId or array of ids; userId number or string)
  const isLikedByUser = (likesList, currentUserId) => {
    if (currentUserId == null || currentUserId === '') return false;
    const likes = Array.isArray(likesList) ? likesList : [];
    const uid = Number(currentUserId) || String(currentUserId);
    return likes.some((u) => {
      if (u == null) return false;
      const likeId = typeof u === 'object' ? (u.id ?? u.documentId) : u;
      if (likeId == null) return false;
      return Number(likeId) === Number(uid) || String(likeId) === String(uid);
    });
  };

  const latestNews = useMemo(() => {
    return (newsList || [])
      .filter((n) => (n.documentId ?? String(n.id)) !== String(id))
      .slice(0, 8);
  }, [newsList, id]);

  const renderSidebarDescription = (description) => {
    if (!description) return '';

    const withoutHtmlImages = description.replace(/<img[^>]*>/gi, '');
    const withoutMarkdownImages = withoutHtmlImages
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/!\[[^\]]*\]\[[^\]]*\]/g, '');
    const withoutImageUrls = withoutMarkdownImages.replace(
      /https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)(?:\?\S*)?/gi,
      ''
    );

    return sidebarMd.render(withoutImageUrls);
  };

  useEffect(() => {
    dispatch(loadAllNews());
  }, [dispatch]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchNewsById(id)
      .then(async (data) => {
        if (cancelled) return;
        setArticle(data);
        const rawLikes = data?.likes;
        const likes = Array.isArray(rawLikes)
          ? rawLikes
          : (Array.isArray(rawLikes?.data) ? rawLikes.data : []);
        setLikesCount(likes.length);
        setLiked(isLikedByUser(likes, userId));

        // Sync from dedicated likes-state endpoint (DB truth), in case API hides likes relation
        try {
          const state = await fetchNewsLikesState(id);
          if (!cancelled && state) {
            if (typeof state.likesCount === 'number') setLikesCount(state.likesCount);
            if (typeof state.liked === 'boolean') setLiked(state.liked);
          }
        } catch {
          // ignore, fallback is article.likes-based state
        }
      })
      .catch(() => {
        if (!cancelled) setArticle(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, userId]);

  const handleToggleLike = async () => {
    if (!userId || !article) return;
    const documentId = article.documentId ?? article.id;
    if (!documentId) return;

    // Optimistic update: change UI immediately so like feels instant
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount((c) => (liked ? Math.max(0, c - 1) : c + 1));

    try {
      if (prevLiked) {
        const res = await unlikeNews(documentId);
        if (typeof res?.likesCount === 'number') setLikesCount(res.likesCount);
      } else {
        const res = await likeNews(documentId);
        if (typeof res?.likesCount === 'number') setLikesCount(res.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
      // Revert on failure
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

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

  const newsBgStyle = {
    backgroundImage: 'url(/feedback-form-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'right center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-background" style={newsBgStyle}>
      {/* Header */}
      <PageHeader
        title={null}
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'News', href: '/news' },
          { label: article.title, href: null },
        ]}
        right={(
          <Link
            href="/news"
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
            {article.news_category?.name && (
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-[4px] bg-primary/10 text-primary text-xs font-semibold">
                  {article.news_category.name}
                </span>
              </div>
            )}
            <h1 className="text-h1 text-gray-900">
              {article.title}
            </h1>
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="rich-content">
              <div dangerouslySetInnerHTML={{ __html: md.render(article.description || '') }} />
            </div>
            {/* Likes at bottom of article */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              {userId ? (
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-purple transition-colors"
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    className={`w-5 h-5 ${liked ? 'fill-current text-primary-purple' : ''}`}
                    strokeWidth={1.8}
                  />
                  {/* <span className="font-medium">{likesCount}</span> */}
                  <span className="text-sm text-gray-500">
                    {likesCount === 1 ? 'like' : 'likes'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Heart className="w-5 h-5" strokeWidth={1.8} />
                  {/* <span className="font-medium">{likesCount}</span> */}
                  <span className="text-sm">{likesCount === 1 ? 'like' : 'likes'}</span>
                </div>
              )}
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
                          {item.news_category?.name && (
                            <div className="mb-1">
                              <span className="inline-block px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary text-xs font-semibold">
                                {item.news_category.name}
                              </span>
                            </div>
                          )}
                          <h3 className="text-h3 text-gray-900 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-body text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: renderSidebarDescription(item.description || '') }} />
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
