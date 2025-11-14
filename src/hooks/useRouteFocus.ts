import type { TransportLine } from '@/data.ts';
import type { LatLngBoundsExpression } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface UseRouteFocusProps {
  line: TransportLine | null;
}

export const useRouteFocus = ({ line }: UseRouteFocusProps) => {
  const map = useMap();

  useEffect(() => {
    if (!line || !line.stops || line.stops.length === 0) {
      return;
    }

    const bounds: LatLngBoundsExpression = line.stops.map((stop) => [stop.lat, stop.lng] as [number, number]);

    map.fitBounds(bounds, {
      padding: [10, 10],
      maxZoom: 18,
      animate: true,
      duration: 0.5,
    });
  }, [line, map]);
};
