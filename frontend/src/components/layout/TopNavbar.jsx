'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';

const NOTIFICATION_POLL_INTERVAL_MS = 20000; // 20 seconds – keeps bell count updated in near real time

function NotificationBellDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async (showLoading = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return;
    try {
      if (showLoading) setLoading(true);
      const data = await api.get(API_ENDPOINTS.NOTIFICATIONS.ME, { params: { limit: 50 } });
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error('Failed to load notifications', e);
      setNotifications([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Load count on mount and when dropdown opens (with loading state)
  useEffect(() => {
    if (open) {
      fetchNotifications(true);
    }
  }, [open, fetchNotifications]);

  // Initial fetch so bell count is visible without opening dropdown
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  // Poll so bell count updates in near real time (e.g. when admin approves quiz reattempt)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return;
    const interval = setInterval(() => fetchNotifications(false), NOTIFICATION_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when user returns to the tab so count is fresh
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (notification) => {
    const id = notification.id ?? notification.documentId;
    if (!id) return;
    try {
      // Mark this notification as read on the backend
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { id });
      // Optimistically remove it from the unread dropdown
      setNotifications((prev) => prev.filter((n) => (n.id ?? n.documentId) !== id));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const handleSeeAllClick = async (e) => {
    e.preventDefault();
    try {
      const ids = notifications
        .map((n) => n.id ?? n.documentId)
        .filter((id) => id != null);
      if (ids.length) {
        await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { ids });
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    } finally {
      setOpen(false);
      router.push('/notifications');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-gray-800 rounded-lg"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[320px] max-h-[400px] overflow-y-auto bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="sticky top-0 px-4 py-3 border-b border-gray-700 bg-[#1a1a1a] flex items-center justify-between gap-3">
            <span className="font-semibold text-white">Notifications</span>
            <Link
              href="/notifications"
              className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
              onClick={handleSeeAllClick}
            >
              See all
            </Link>
          </div>
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No notifications</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {notifications.map((n) => (
                <li
                  key={n.id ?? n.documentId ?? n.createdAt + n.title}
                  className="px-4 py-3 text-left bg-gray-800/50 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="font-medium text-white text-sm">{n.title || n.type}</div>
                  <div className="text-gray-400 text-sm mt-0.5">{n.message}</div>
                  {n.createdAt && (
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileAvatarDropdown() {
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.profile-avatar-dropdown')) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <div className="relative profile-avatar-dropdown">
      <Avatar
        className="h-10 w-10 border-2 border-gray-700 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Erin" />
        <AvatarFallback className="bg-purple-600 text-white">ER</AvatarFallback>
      </Avatar>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopNavbar({ onMobileMenuToggle }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#000000] border-b border-gray-800 z-50">
      <div className="h-full px-4 sm:px-6 flex items-center">
        {/* LEFT LOGOS */}
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <img src="/aia_logo.png" alt="AIA" className="h-10 w-auto object-contain" />
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-700"></div>
          <div className="hidden sm:flex items-center">
            <img src="/vega_logo.png" alt="VEGA" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4 ml-auto">
          <div
            className="relative flex items-center bg-[#3d2d4f] rounded-xl px-5 py-3"
            style={{ width: '303px', height: '40px' }}
          >
            <input
              type="text"
              placeholder="Search people, courses"
              className="flex-1 bg-transparent outline-none text-gray-300 placeholder:text-gray-400"
            />
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          <NotificationBellDropdown />

          <ProfileAvatarDropdown />
        </div>
      </div>
    </header>
  );
}