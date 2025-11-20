import { routeCoordinatesStore } from '@/store/routeCoordinatesStore';
import { useEffect } from 'react';

/**
 * Hook to handle initial routes visibility flash
 * This is a workaround to force initial bus markers to render
 */
export const useInitialRoutesFlash = (setVisibleRoutes: (routes: boolean[]) => void, routesCount: number): void => {
  useEffect(() => {
    if (routesCount === 0) return;

    const allVisible = Array(routesCount).fill(true);
    const allHidden = Array(routesCount).fill(false);
    const HIDE_DELAY_MS = 100;
    const CHECK_INTERVAL_MS = 250;
    const MAX_WAIT_MS = 10000;

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (maxWaitTimer) {
        clearTimeout(maxWaitTimer);
        maxWaitTimer = null;
      }
    };

    const hideRoutes = () => {
      if (!hideTimer) {
        hideTimer = setTimeout(() => {
          setVisibleRoutes(allHidden);
          clearTimers();
        }, HIDE_DELAY_MS);
      }
    };

    const hasTransportInDom = () =>
      typeof document !== 'undefined' ? Boolean(document.querySelector('.bus-marker-icon')) : false;

    const areRoutesInitialized = () => Object.keys(routeCoordinatesStore).length >= routesCount;

    const checkReadyState = () => {
      if (areRoutesInitialized() && hasTransportInDom()) {
        hideRoutes();
      }
    };

    setVisibleRoutes(allVisible);
    checkReadyState();

    checkInterval = setInterval(checkReadyState, CHECK_INTERVAL_MS);
    maxWaitTimer = setTimeout(hideRoutes, MAX_WAIT_MS);

    return clearTimers;
  }, [setVisibleRoutes, routesCount]);
};
