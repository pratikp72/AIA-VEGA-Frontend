import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll functionality.
 * Handles IntersectionObserver setup and automatic page loading.
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.isLoading - Whether data is currently loading
 * @param {number} options.currentPage - Current page number
 * @param {number} options.totalPages - Total number of pages
 * @param {Function} options.onLoadMore - Callback function when more data should be loaded
 * @param {string} [options.rootMargin='200px 0px'] - IntersectionObserver root margin
 * @param {number} [options.threshold=0.01] - IntersectionObserver threshold
 * @param {boolean} [options.enabled=true] - Whether the observer is enabled
 * 
 * @returns {Object} - Returns sentinel ref to attach to a DOM element
 * 
 * @example
 * const sentinelRef = useInfiniteScroll({
 *   isLoading,
 *   currentPage,
 *   totalPages,
 *   onLoadMore: () => dispatch(loadMoreAction()),
 *   enabled: isAutoMode
 * });
 * 
 * return <div ref={sentinelRef} className="sentinel" />
 */
export const useInfiniteScroll = ({
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onLoadMore = () => {},
  rootMargin = '200px 0px',
  threshold = 0.01,
  enabled = true,
} = {}) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    // Don't observe if disabled, loading, at last page, or no callback
    if (!enabled || isLoading || currentPage >= totalPages) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if sentinel is intersecting
        if (!entries[0]?.isIntersecting) return;
        
        // Double-check conditions before calling callback
        if (isLoading || currentPage >= totalPages) return;

        onLoadMore();
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, isLoading, currentPage, totalPages, onLoadMore, rootMargin, threshold]);

  return sentinelRef;
};

export default useInfiniteScroll;
