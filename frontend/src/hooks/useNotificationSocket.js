'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/services/socket';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

/**
 * Hook for real-time notifications via socket.io.
 *
 * - Fetches unread notifications ONCE on mount via REST.
 * - Listens for 'new-notification' socket events for real-time updates.
 * - Retries getting the socket every 2 s if unavailable on first mount
 *   (handles the case where authToken is loaded asynchronously).
 * - Re-fetches on socket reconnect and on window regain-focus.
 * - No polling.
 *
 * Returns: { notifications, unreadCount, loading, markRead, markAllRead }
 */
export function useNotificationSocket() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);
  const socketSetupRef = useRef(false);  // prevents double-setup
  const retryTimerRef = useRef(null);
  const socketCleanupRef = useRef(null);  // stores cleanup fn from setupSocket

  // ── Fetch unread notifications via REST ───────────────────────────────────
  const fetchNotifications = useCallback(async (showLoading = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      if (mountedRef.current) setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      const data = await api.get(API_ENDPOINTS.NOTIFICATIONS.ME, { params: { limit: 50 } });
      if (mountedRef.current) {
        setNotifications(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (e) {
      console.error('[useNotificationSocket] Fetch failed', e);
      if (mountedRef.current) setNotifications([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // ── Set up socket listeners (idempotent) ─────────────────────────────────
  const setupSocket = useCallback(() => {
    if (!mountedRef.current) return;
    if (socketSetupRef.current) return;   // already set up

    const socket = getSocket();
    if (!socket) {
      // authToken not yet available — retry in 2 s (only one pending timer at a time)
      if (!retryTimerRef.current) {
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          if (mountedRef.current) setupSocket();
        }, 2000);
      }
      return;
    }

    socketSetupRef.current = true;

    const handleNewNotification = (payload) => {
      if (!mountedRef.current) return;
      setNotifications((prev) => {
        const id = payload?.id ?? payload?.documentId;
        if (id && prev.some((n) => (n.id ?? n.documentId) === id)) return prev;
        return [
          { ...payload, is_read: false, createdAt: payload.createdAt || new Date().toISOString() },
          ...prev,
        ];
      });
    };

    const handleReconnect = () => {
      fetchNotifications(false);
    };

    socket.on('new-notification', handleNewNotification);
    socket.io?.on('reconnect', handleReconnect);

    // Store cleanup so the effect teardown can call it even if set up via retry
    socketCleanupRef.current = () => {
      socket.off('new-notification', handleNewNotification);
      socket.io?.off('reconnect', handleReconnect);
      socketSetupRef.current = false;
    };
  }, [fetchNotifications]);

  // ── Main effect: initial fetch + socket setup + focus refetch ─────────────
  useEffect(() => {
    mountedRef.current = true;
    socketSetupRef.current = false;
    socketCleanupRef.current = null;

    // Initial REST fetch (once per mount)
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNotifications(true);
    }

    // Set up socket listeners (retries if token not ready)
    setupSocket();

    // Re-fetch when the user returns to the tab (cheap safety net)
    const handleFocus = () => {
      if (mountedRef.current) fetchNotifications(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      mountedRef.current = false;
      hasFetchedRef.current = false;  // allow re-fetch on next mount
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (typeof socketCleanupRef.current === 'function') {
        socketCleanupRef.current();
        socketCleanupRef.current = null;
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications, setupSocket]);

  // ── Mark one notification as read ─────────────────────────────────────────
  const markRead = useCallback(async (notification) => {
    const id = notification?.id ?? notification?.documentId;
    if (!id) return;
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { id });
      setNotifications((prev) => prev.filter((n) => (n.id ?? n.documentId) !== id));
    } catch (e) {
      console.error('[useNotificationSocket] markRead failed', e);
    }
  }, []);

  // ── Mark all notifications as read ────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const ids = notifications
      .map((n) => n.id ?? n.documentId)
      .filter((id) => id != null);
    if (!ids.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { ids });
    } catch (e) {
      console.error('[useNotificationSocket] markAllRead failed', e);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    loading,
    markRead,
    markAllRead,
  };
}

