'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { getCurrentUser, getAvatarPropsForUser } from '@/lib/auth';
import { globalSearch } from '@/features/search/globalSearchAPI';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;

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

function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ people: [], courses: [] });

  const runSearch = useCallback(async (q) => {
    const trimmed = String(q || '').trim();
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      setResults({ people: [], courses: [] });
      setOpen(trimmed.length > 0);
      return;
    }
    setLoading(true);
    try {
      const data = await globalSearch(trimmed);
      setResults(data);
      setOpen(true);
    } catch (e) {
      setResults({ people: [], courses: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults({ people: [], courses: [] });
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = useCallback((href, searchQuery) => {
    setOpen(false);
    setQuery('');
    if (searchQuery) {
      router.push(`${href}?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(href);
    }
  }, [router]);

  const hasResults = results.people.length > 0 || results.courses.length > 0;
  const showDropdown = open && (query.trim().length >= SEARCH_MIN_LENGTH && (loading || hasResults));

  return (
    <div className="relative global-search-container" ref={containerRef} style={{ width: '303px' }}>
      <div className="flex items-center bg-[#3d2d4f] rounded-xl px-5 py-3 h-10 w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= SEARCH_MIN_LENGTH && setOpen(true)}
          placeholder="Search people, courses"
          className="flex-1 min-w-0 bg-transparent outline-none text-gray-300 placeholder:text-gray-400"
          aria-label="Search people and courses"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {loading ? (
          <span className="text-gray-400 text-xs">Searching…</span>
        ) : (
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
        )}
      </div>
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 max-h-[320px] overflow-y-auto bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl z-[100]"
          role="listbox"
        >
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">Searching…</div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No people or courses found</div>
          ) : (
            <>
              {results.people.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> People
                  </div>
                  <ul className="divide-y divide-gray-700/50">
                    {results.people.map((p) => (
                      <li key={`person-${p.id}`}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-700/70 flex flex-col gap-0.5"
                          onClick={() => handleSelect(p.href, p.searchQuery)}
                          role="option"
                        >
                          <span className="font-medium text-white text-sm truncate">{p.name}</span>
                          {p.subtitle && (
                            <span className="text-gray-400 text-xs truncate">{p.subtitle}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.courses.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Courses
                  </div>
                  <ul className="divide-y divide-gray-700/50">
                    {results.courses.map((c) => (
                      <li key={`course-${c.id}-${c.documentId}`}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-700/70 flex flex-col gap-0.5"
                          onClick={() => handleSelect(c.href, null)}
                          role="option"
                        >
                          <span className="font-medium text-white text-sm truncate">{c.name}</span>
                          {c.subtitle && (
                            <span className="text-gray-400 text-xs truncate">{c.subtitle}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileAvatarDropdown() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

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

  const { src, initials } = getAvatarPropsForUser(user);

  return (
    <div className="relative profile-avatar-dropdown">
      <Avatar
        className="h-10 w-10 border-2 border-gray-700 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <AvatarImage src={src} alt="" />
        <AvatarFallback className="bg-primary text-white text-sm">{initials}</AvatarFallback>
      </Avatar>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
          <GlobalSearch />

          <NotificationBellDropdown />

          <ProfileAvatarDropdown />
        </div>
      </div>
    </header>
  );
}