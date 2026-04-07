import L from 'leaflet';
import { type FC, useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Implements Google Maps-style double-tap zoom for iOS.
 *
 * - Double-tap (quick release): zoom in by 1 at tap point
 * - Double-tap + hold + drag up/down: continuously zoom in/out around tap point
 *
 * Leaflet 1.9 removed the Tap plugin that used to synthesize dblclick from touch,
 * so we replicate the gesture manually.
 */
const DoubleTapZoom: FC = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    let lastTapEndTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    let dragZooming = false;
    let dragStartY = 0;
    let dragStartZoom = 0;
    let dragCenter: L.LatLng | null = null;

    const toContainerLatLng = (clientX: number, clientY: number): L.LatLng => {
      const point = map.mouseEventToContainerPoint({ clientX, clientY } as MouseEvent);
      return map.containerPointToLatLng(point);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const now = Date.now();
      const dt = now - lastTapEndTime;
      const dx = Math.abs(touch.clientX - lastTapX);
      const dy = Math.abs(touch.clientY - lastTapY);

      // Second touch within 300ms and ≤20px from first — enter drag-zoom
      if (dt < 300 && dx < 20 && dy < 20) {
        e.preventDefault();
        dragZooming = true;
        dragStartY = touch.clientY;
        dragStartZoom = map.getZoom();
        dragCenter = toContainerLatLng(touch.clientX, touch.clientY);
        map.dragging.disable();
        lastTapEndTime = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragZooming || e.touches.length !== 1) return;
      e.preventDefault();

      const dy = dragStartY - e.touches[0].clientY; // up = positive = zoom in
      if (dragCenter) {
        map.setZoomAround(dragCenter, dragStartZoom + dy / 100, { animate: false });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (dragZooming) {
        dragZooming = false;
        map.dragging.enable();

        // Barely moved → treat as plain double-tap, snap zoom in by 1
        const touch = e.changedTouches[0];
        if (Math.abs(touch.clientY - dragStartY) < 8 && dragCenter) {
          map.setZoomAround(dragCenter, dragStartZoom + 1);
        }
        lastTapEndTime = 0;
        return;
      }

      if (e.changedTouches.length !== 1 || e.touches.length !== 0) return;

      const touch = e.changedTouches[0];
      lastTapEndTime = Date.now();
      lastTapX = touch.clientX;
      lastTapY = touch.clientY;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [map]);

  return null;
};

export default DoubleTapZoom;
