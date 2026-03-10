"use client";

import { useEffect, useRef } from 'react';
import telemetryService from '@/services/telemetry';

/**
 * Tracks route visits, per-page active time, and click count.
 * It emits start/end events for each route and flushes pending telemetry
 * during lifecycle transitions like tab hide and page unload.
 */
export default function useTelemetryTracking(pathname, searchParams) {
  const activeRouteRef = useRef('');
  const routeStartMsRef = useRef(0);
  const clickCountRef = useRef(0);

  useEffect(() => {
    telemetryService.startLifecycle();
    return () => {
      telemetryService.stopLifecycle();
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const search = searchParams?.toString() || '';
    const nextRoute = telemetryService.buildRoutePath(pathname, search);
    const now = Date.now();

    if (activeRouteRef.current && routeStartMsRef.current > 0) {
      const elapsedSeconds = (now - routeStartMsRef.current) / 1000;
      telemetryService.trackPageViewEnded(
        activeRouteRef.current,
        elapsedSeconds,
        clickCountRef.current,
        { reason: 'route_change' }
      );
    }

    activeRouteRef.current = nextRoute;
    routeStartMsRef.current = now;
    clickCountRef.current = 0;

    telemetryService.trackPageViewStarted(nextRoute, {
      referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClickCapture = () => {
      clickCountRef.current += 1;
    };

    document.addEventListener('click', onClickCapture, true);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  useEffect(() => {
    const endCurrentPage = (reason) => {
      if (!activeRouteRef.current || routeStartMsRef.current <= 0) return;
      const elapsedSeconds = (Date.now() - routeStartMsRef.current) / 1000;
      telemetryService.trackPageViewEnded(
        activeRouteRef.current,
        elapsedSeconds,
        clickCountRef.current,
        { reason }
      );
      routeStartMsRef.current = Date.now();
      clickCountRef.current = 0;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endCurrentPage('visibility_hidden');
        telemetryService.flushWithKeepalive();
      }
    };

    const onPageHide = () => {
      endCurrentPage('pagehide');
      telemetryService.flushWithKeepalive();
    };

    const onBeforeUnload = () => {
      endCurrentPage('beforeunload');
      telemetryService.flushWithKeepalive();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);
}
