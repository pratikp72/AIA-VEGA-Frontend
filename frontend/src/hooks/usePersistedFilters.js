"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * A custom hook that persists filter/sort state in URL search params so that
 * the user's selections survive page refreshes.
 *
 * @param {Object} filterDefaults - An object mapping filter keys to their default
 *   values. Example: { sortBy: '', departmentFilter: '', search: '' }
 * @param {Object} [options]
 * @param {string[]} [options.exclude] - Keys from the URL that should NOT be managed
 *   by this hook (e.g. keys set by other logic like "personId").
 * @returns {{ filters: Object, setFilter: (key: string, value: any) => void, setFilters: (updates: Object) => void, resetFilters: () => void }}
 */
export default function usePersistedFilters(filterDefaults = {}, options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const excludeKeys = options.exclude || [];

  // Read initial values from URL, falling back to the provided defaults.
  const getInitialValues = () => {
    const values = {};
    for (const [key, defaultValue] of Object.entries(filterDefaults)) {
      const urlValue = searchParams.get(key);
      if (urlValue !== null && urlValue !== '') {
        values[key] = urlValue;
      } else {
        values[key] = defaultValue;
      }
    }
    return values;
  };

  const [filters, setFiltersState] = useState(getInitialValues);

  // Keep a ref so we can build URLs without stale closures
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Build the URL search string from the current filter state while preserving
  // any search-params that we don't manage (e.g. personId, personEmpId, etc.).
  const buildSearchString = useCallback(
    (nextFilters) => {
      const params = new URLSearchParams();

      // Preserve non-managed params
      for (const [key, value] of searchParams.entries()) {
        if (!(key in filterDefaults) && !excludeKeys.includes(key)) {
          params.set(key, value);
        }
      }

      // Set managed params (skip empty / default values to keep URL clean)
      for (const [key, value] of Object.entries(nextFilters)) {
        if (value !== '' && value !== null && value !== undefined && value !== filterDefaults[key]) {
          params.set(key, String(value));
        }
      }

      const qs = params.toString();
      return qs ? `?${qs}` : '';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname],
  );

  // Push the new URL (replaces so Back button isn't polluted with every filter change)
  const pushUrl = useCallback(
    (nextFilters) => {
      const qs = buildSearchString(nextFilters);
      router.replace(`${pathname}${qs}`, { scroll: false });
    },
    [buildSearchString, pathname, router],
  );

  /** Set a single filter value and update the URL. */
  const setFilter = useCallback(
    (key, value) => {
      setFiltersState((prev) => {
        const next = { ...prev, [key]: value };
        // Push URL asynchronously so React can batch state updates
        setTimeout(() => pushUrl(next), 0);
        return next;
      });
    },
    [pushUrl],
  );

  /** Set multiple filter values at once and update the URL. */
  const setFilters = useCallback(
    (updates) => {
      setFiltersState((prev) => {
        const next = { ...prev, ...updates };
        setTimeout(() => pushUrl(next), 0);
        return next;
      });
    },
    [pushUrl],
  );

  /** Reset all filters back to their defaults and update the URL. */
  const resetFilters = useCallback(() => {
    const defaults = { ...filterDefaults };
    setFiltersState(defaults);
    setTimeout(() => pushUrl(defaults), 0);
  }, [filterDefaults, pushUrl]);

  return { filters, setFilter, setFilters, resetFilters };
}
