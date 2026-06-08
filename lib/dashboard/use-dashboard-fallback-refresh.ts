"use client";

import { useCallback, useEffect, useRef } from "react";
import { refreshDashboardAction } from "./actions";

const REFRESH_INTERVAL_MS = 60_000; // 60 seconds

/**
 * A lightweight silent fallback refresh for the Dashboard.
 *
 * Every 60 seconds, while the tab is visible, calls the server to re-fetch
 * dashboard data and silently reconciles component state.  This is purely a
 * safety net — realtime remains the primary source of updates.
 *
 * - Pauses when the tab is hidden (Page Visibility API).
 * - Resumes when the tab becomes visible.
 * - Guarantees only one interval exists at a time.
 * - No spinners, no toasts, no visual flicker.
 *
 * @param onRefresh - Called with the fresh DashboardData when available.
 *                    The caller should merge the result into local state.
 */
export function useDashboardFallbackRefresh(
  onRefresh: () => Promise<void>,
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Track visibility so we can pause/resume the interval.
  const isVisibleRef = useRef(true);

  const startInterval = useCallback(() => {
    if (intervalRef.current !== null) return; // already running

    console.log("[DashboardFallbackRefresh] started");

    intervalRef.current = setInterval(async () => {
      if (!isVisibleRef.current) return; // shouldn't fire, but guard anyway

      console.log("[DashboardFallbackRefresh] refresh executed");
      try {
        await onRefreshRef.current();
      } catch {
        // Swallow — this is a silent safety net.
      }
    }, REFRESH_INTERVAL_MS);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current === null) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
    console.log("[DashboardFallbackRefresh] cleaned up");
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        isVisibleRef.current = true;
        console.log("[DashboardFallbackRefresh] resumed");
        startInterval();
      } else {
        isVisibleRef.current = false;
        console.log("[DashboardFallbackRefresh] paused");
        stopInterval();
      }
    };

    // Start the interval when the hook mounts.
    startInterval();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopInterval();
    };
  }, [startInterval, stopInterval]);
}
