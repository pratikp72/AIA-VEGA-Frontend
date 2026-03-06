'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import Loader from '@/components/common/Loader';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await api.get(API_ENDPOINTS.NOTIFICATIONS.ALL, {
          params: { limit: 200, sort: 'createdAt:desc' },
        });
        setNotifications(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error('Failed to load notifications history', e);
        setError('Failed to load notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            All notifications you&apos;ve received, sorted by most recent.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center min-h-[200px] shadow-sm">
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
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id ?? n.documentId ?? n.createdAt + n.title}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
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
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

