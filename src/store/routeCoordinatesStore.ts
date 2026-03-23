import type { RouteCoordinates } from '@/utils';
import { buildRouteGeometry } from '@/utils';
import { lines } from '@/data';
import routeCoords from '@/routeCoords.json';
import L from 'leaflet';

/**
 * Global store for route coordinates
 * Shared between components to avoid prop drilling
 */
export const routeCoordinatesStore: RouteCoordinates = {};

// Pre-populate hardcoded route geometries
const rawCoords = routeCoords as unknown as Record<string, [number, number][]>;

for (const line of lines) {
  const coords = rawCoords[String(line.id)];
  if (coords) {
    routeCoordinatesStore[line.id] = buildRouteGeometry(
      coords.map(([lat, lng]) => L.latLng(lat, lng)),
      line.stops,
    );
  }
}
