'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, Users, BookOpen, User, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/services/endpoints';
import { getCurrentUser, getAvatarPropsForUser } from '@/lib/auth';
import { globalSearch } from '@/features/search/globalSearchAPI';
import Loader from '@/components/common/Loader';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;

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

function isProfileRequestUserUpdate(notification) {
  const type = String(notification?.type || '').trim().toLowerCase();
  const meta = parseNotificationMeta(notification);
  const action = String(meta?.action || '').trim().toLowerCase();
  if (type !== 'profile_edit_request') return false;
  return action === 'status_update' || action === 'pending_comment';
}

function NotificationBellDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  // Real-time notifications via socket.io — no polling
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotificationSocket();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleNotificationClick = async (notification) => {
    await markRead(notification);

    if (isProfileRequestUserUpdate(notification)) {
      const meta = parseNotificationMeta(notification);
      const requestId = meta?.requestId;
      setOpen(false);
      router.push(
        requestId
          ? `/profile?requestId=${encodeURIComponent(String(requestId))}`
          : '/profile'
      );
    }
  };

  const handleSeeAllClick = async (e) => {
    e.preventDefault();
    try {
      await markAllRead();
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
        onClick={() => {
          setOpen((o) => {
            if (!o && unreadCount > 0) markAllRead();
            return !o;
          });
        }}
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
            <div className="px-4 py-6 flex items-center justify-center">
              <Loader size="md" />
            </div>
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
                  <div className="text-gray-400 text-sm mt-0.5 line-clamp-3">{n.message}</div>
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

  const handleSelect = useCallback((href, searchQuery, company) => {
    setOpen(false);
    setQuery('');
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    const normalizedCompany = String(company || '').trim().toUpperCase();
    if (normalizedCompany === 'VEGA' || normalizedCompany === 'AIA') {
      params.set('company', normalizedCompany);
    }
    const qs = params.toString();
    router.push(qs ? `${href}?${qs}` : href);
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
            <div className="px-4 py-6 flex items-center justify-center">
              <Loader size="md" />
            </div>
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
                          onClick={() => handleSelect(p.href, p.searchQuery, p.company)}
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
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const localUser = getCurrentUser();
      if (isMounted) setUser(localUser);

      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) return;

      try {
        const me = await api.get(API_ENDPOINTS.AUTH.ME, {
          params: {
            'populate[photograph]': true,
          },
        });
        const freshUser = me?.user || me?.data || me;
        const userId = freshUser?.id ?? localUser?.id ?? localUser?.documentId;

        let mergedUser = freshUser;
        if (userId) {
          try {
            const fullUserRes = await api.get(API_ENDPOINTS.USERS.GET(userId), {
              params: {
                'populate[photograph]': true,
              },
            });
            const fullUser = fullUserRes?.data || fullUserRes;
            if (fullUser) {
              mergedUser = { ...freshUser, ...fullUser };
            }
          } catch {
            // Keep auth/me response if users/:id fails.
          }
        }

        if (mergedUser && isMounted) {
          const avatarFromMerged = getAvatarPropsForUser(mergedUser);
          if (!avatarFromMerged.src) {
            try {
              const searchKey = mergedUser?.email || mergedUser?.emp_id || mergedUser?.emp_code || mergedUser?.username || '';
              if (searchKey) {
                const analytics = await api.get(API_ENDPOINTS.ANALYTICS.EMPLOYEES, {
                  params: { search: searchKey, page: 1, pageSize: 25 },
                });
                const items = Array.isArray(analytics?.items) ? analytics.items : [];
                const matched = items.find((emp) =>
                  (mergedUser?.id && emp?.id === mergedUser.id) ||
                  (mergedUser?.email && emp?.email === mergedUser.email) ||
                  (mergedUser?.emp_id && emp?.emp_id === mergedUser.emp_id) ||
                  (mergedUser?.emp_code && emp?.emp_code === mergedUser.emp_code)
                ) || items[0];
                if (matched) mergedUser = { ...mergedUser, ...matched };
              }
            } catch {
              // Keep merged user if analytics fallback fails.
            }
          }

          setUser(mergedUser);
          localStorage.setItem('user', JSON.stringify(mergedUser));
        }
      } catch {
        // Keep local user as fallback when profile fetch fails.
      }
    };

    // Silently check if this user has an Administration Panel account
    const checkAdminAccess = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) return;
      try {
        const result = await api.get(API_ENDPOINTS.AUTH.CHECK_ADMIN_ACCESS);
        if (isMounted) {
          setHasAdminAccess(result?.hasAdminAccess === true);
        }
      } catch {
        // Not an admin user — silently keep hasAdminAccess = false
      }
    };

    loadUser();
    checkAdminAccess();

    return () => {
      isMounted = false;
    };
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

  const handleAdminPanel = async () => {
    setOpen(false);
    setAdminLoading(true);
    try {
      const result = await api.get(API_ENDPOINTS.AUTH.ADMIN_TOKEN);
      const adminToken = result?.adminToken;
      const refreshToken = result?.refreshToken;
      if (adminToken) {
        // Open the Strapi-served HTML redirect page (on port 1337 — same origin as admin panel).
        // This ensures localStorage.setItem('jwtToken') writes to port 1337's storage,
        // where the Strapi admin panel can read it. This works on all environments.
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';
        const strapiBase = apiBase.replace(/\/api\/?$/, '');
        const params = new URLSearchParams({ token: adminToken });
        if (refreshToken) params.set('refresh', refreshToken);
        window.open(
          `${strapiBase}/api/auth/admin-html-redirect?${params.toString()}`,
          '_blank'
        );
      } else {
        alert('Failed to generate Admin Panel access. Please try again.');
      }
    } catch (err) {
      const message = err?.error?.message || err?.message || '';
      if (err?.status === 403 || message.toLowerCase().includes('admin')) {
        alert("You don't have access to the Admin Panel.");
      } else {
        alert('Failed to access Admin Panel. Please try again.');
      }
    } finally {
      setAdminLoading(false);
    }
  };

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
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          {hasAdminAccess && (
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-60"
              onClick={handleAdminPanel}
              disabled={adminLoading}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {adminLoading ? 'Opening…' : 'Admin Panel'}
            </button>
          )}
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
  const getUserCompany = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return String(user?.company ?? '').trim().toUpperCase();
    } catch {
      return '';
    }
  };

  const company = typeof window !== 'undefined' ? getUserCompany() : '';
  const isVega = company === 'VEGA';

  const aiaLogo = (
    <div className="flex items-center">
      <img src="/aia_logo.png" alt="AIA" className="h-10 w-auto object-contain" />
    </div>
  );
  const separator = <div className="hidden sm:block w-px h-8 bg-gray-700"></div>;
  const vegaLogo = (
    <div className="hidden sm:flex items-center">
      <img src="/vega_logo.png" alt="VEGA" className="h-10 w-auto object-contain" />
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#000000] border-b border-gray-800 z-50">
      <div className="h-full px-4 sm:px-6 flex items-center">
        {/* LEFT LOGOS */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => (window.location.href = '/home')}>
          {isVega ? (
            <>{vegaLogo}{separator}{aiaLogo}</>
          ) : (
            <>{aiaLogo}{separator}{vegaLogo}</>
          )}
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