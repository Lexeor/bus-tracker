import { useEffect } from 'react';

/**
 * Hook to handle initial routes visibility flash
 * This is a workaround to force initial bus markers to render
 */
export const useInitialRoutesFlash = (setVisibleRoutes: (routes: boolean[]) => void, routesCount: number): void => {
  useEffect(() => {
    const allVisible = Array(routesCount).fill(true);
    const allHidden = Array(routesCount).fill(false);

    setVisibleRoutes(allVisible);
    const timer = setTimeout(() => setVisibleRoutes(allHidden), 500);

    return () => clearTimeout(timer);
  }, [setVisibleRoutes, routesCount]);
};
