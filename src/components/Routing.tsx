import L from 'leaflet';
import { type FC, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { RouteCoordinates, Stop } from '../utils';

const TEMP_OSRM_SRV_URL = 'https://bus-tracker.duckdns.org/osrm/route/v1';

interface RoutingProps {
  stops: Stop[];
  color: string;
  lineId: number;
  onRouteReady: (coordinates: L.LatLng[]) => void;
  hidden?: boolean;
  routeCoordinatesStore: RouteCoordinates;
}

// Extend the type to include internal properties
interface RoutingControl extends L.Routing.Control {
  _plan?: any;
  _line?: L.Polyline;
}

const Routing: FC<RoutingProps> = ({ stops, color, lineId, onRouteReady, hidden, routeCoordinatesStore }) => {
  const map = useMap();
  const routingControlRef = useRef<RoutingControl | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    // Cleanup function
    const cleanup = () => {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      if (routingControlRef.current) {
        try {
          const control = routingControlRef.current;
          if (control._plan) {
            control._plan.setWaypoints([]);
          }
          if (control._line) {
            map.removeLayer(control._line);
          }
          map.removeControl(control);
        } catch (error) {
          console.warn('Error removing routing control:', error);
        }
        routingControlRef.current = null;
      }
    };

    // If hidden, don't render anything
    if (hidden) {
      cleanup();

      // But notify parent if we have cached data
      if (routeCoordinatesStore[lineId]) {
        onRouteReady(routeCoordinatesStore[lineId]);
      }
      return;
    }

    // Check if we have cached coordinates
    const cachedCoordinates = routeCoordinatesStore[lineId];

    if (cachedCoordinates && cachedCoordinates.length > 0) {
      // Use cached data - just draw a polyline
      try {
        polylineRef.current = L.polyline(cachedCoordinates, {
          color,
          weight: 4,
          opacity: 0.6,
        }).addTo(map);

        onRouteReady(cachedCoordinates);
      } catch (error) {
        console.error('Error creating polyline from cache:', error);
      }
    } else {
      // First time - fetch route from OSRM
      try {
        const routingControl = L.Routing.control({
          waypoints: stops.map((stop) => L.latLng(stop.lat, stop.lng)),
          lineOptions: {
            styles: [{ color, weight: 4, opacity: 0.6 }],
            extendToWaypoints: false,
            missingRouteTolerance: 0,
          },
          routeWhileDragging: false,
          addWaypoints: false,
          fitSelectedRoutes: false,
          show: false,
          // @ts-expect-error - leaflet-routing-machine types are incomplete
          createMarker: () => null,
          router: L.routing.osrmv1({
            serviceUrl: TEMP_OSRM_SRV_URL,
          }),
        }) as RoutingControl;

        routingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          if (routes?.[0]?.coordinates) {
            const coordinates: L.LatLng[] = routes[0].coordinates;

            // Cache the coordinates
            routeCoordinatesStore[lineId] = coordinates;

            onRouteReady(coordinates);
          }
        });

        routingControl.on('routingerror', (e: any) => {
          console.error('Routing error for line', lineId, ':', e);
        });

        routingControl.addTo(map);
        routingControlRef.current = routingControl;
      } catch (error) {
        console.error('Error creating routing control:', error);
      }
    }

    return cleanup;
  }, [map, lineId, hidden, color, stops, onRouteReady, routeCoordinatesStore]);

  return null;
};

export default Routing;
