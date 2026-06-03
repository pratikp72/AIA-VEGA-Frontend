'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import Loader from '@/components/common/Loader';

const PAGE_SIZE = 20;

function parseNotificationMeta(notification) {
  const meta = notification?.meta;
  if (meta && typeof meta === 'object') return meta;
  if (typeof meta === 'string') {
    try {
      const parsed = JSON.parse(meta);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function getProfileRequestRedirect(notification) {
  const type = String(notification?.type || '').trim().toLowerCase();
  if (type !== 'profile_edit_request') return null;
  const meta = parseNotificationMeta(notification);
  const action = String(meta?.action || '').trim().toLowerCase();
  if (action !== 'status_update' && action !== 'pending_comment') return null;
  const requestId = meta?.requestId;
  if (requestId == null || requestId === '') return '/profile';
  return `/profile?requestId=${encodeURIComponent(String(requestId))}`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async (pageNum) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) { setLoading(false); return; }

    setLoading(true);
    setError(null);

    try {
      const data = await api.get(API_ENDPOINTS.NOTIFICATIONS.ALL, {
        params: {
          page:     pageNum,
          pageSize: PAGE_SIZE,
          sort:     'createdAt:desc',
        },
      });

      const items = Array.isArray(data?.data) ? data.data : [];
      const pagination = data?.meta?.pagination ?? {};
      const totalCount = pagination.total ?? items.length;
      const pages = pagination.pageCount ?? Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

      setNotifications(items);
      setTotal(totalCount);
      setTotalPages(pages);
    } catch (e) {
      console.error('Failed to load notifications', e);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem   = Math.min(page * PAGE_SIZE, total);

  const handleNotificationClick = (notification) => {
    const href = getProfileRequestRedirect(notification);
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          All notifications you&apos;ve received, sorted by most recent.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white flex items-center justify-center min-h-[200px] shadow-sm">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="px-4 py-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8 rounded-xl border border-gray-200 bg-white text-center text-gray-500 text-sm shadow-sm">
          You have no notifications yet.
        </div>
      ) : (
        <>
          {/* Notification list */}
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id ?? n.documentId ?? n.createdAt + n.title}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                role="button"
                tabIndex={0}
                onClick={() => handleNotificationClick(n)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotificationClick(n);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {n.title || n.type}
                    </div>
                    <div className="text-gray-600 text-sm mt-0.5">{n.message}</div>
                  </div>
                  {n.createdAt && (
                    <div className="text-gray-400 text-xs mt-0.5 whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startItem}–{endItem} of {total}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
