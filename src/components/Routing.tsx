import L from 'leaflet';
import { type FC, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { RouteCoordinates, Stop } from '../utils';

const TEMP_OSRM_SRV_URL = 'https://bus-tracker.duckdns.org/osrm/route/v1';

const Routing: FC<{
  stops: Stop[];
  color: string;
  lineId: number;
  onRouteReady: (coordinates: L.LatLng[]) => void;
  hidden?: boolean;
  routeCoordinatesStore: RouteCoordinates;
}> = ({ stops, color, lineId, onRouteReady, hidden, routeCoordinatesStore }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let routingControl: any = null;

    // If hidden, just ensure we have coordinates cached but don't show
    if (hidden) {
      if (routeCoordinatesStore[lineId]) {
        onRouteReady(routeCoordinatesStore[lineId]);
      }
      return;
    }

    // Check if we already have cached coordinates
    if (routeCoordinatesStore[lineId]) {
      onRouteReady(routeCoordinatesStore[lineId]);

      // Still need to create control to show the line
      try {
        routingControl = L.Routing.control({
          waypoints: stops.map((s) => L.latLng(s.lat, s.lng)),
          lineOptions: {
            styles: [{ color, weight: 4, opacity: 0.6 }],
            extendToWaypoints: false,
            missingRouteTolerance: 0,
          },
          routeWhileDragging: false,
          addWaypoints: false,
          fitSelectedRoutes: false,
          show: false,
          //@ts-expect-error Doc not full
          createMarker: () => null,
          router: L.routing.osrmv1({
            serviceUrl: TEMP_OSRM_SRV_URL,
          }),
        });

        routingControl.addTo(map);
      } catch (error) {
        console.error('Error creating routing control:', error);
      }
    } else {
      // First time - create control and cache coordinates
      try {
        routingControl = L.Routing.control({
          waypoints: stops.map((s) => L.latLng(s.lat, s.lng)),
          lineOptions: {
            styles: [{ color, weight: 4, opacity: 0.6 }],
            extendToWaypoints: false,
            missingRouteTolerance: 0,
          },
          routeWhileDragging: false,
          addWaypoints: false,
          fitSelectedRoutes: false,
          show: false,
          //@ts-expect-error Doc not full
          createMarker: () => null,
          router: L.routing.osrmv1({
            serviceUrl: TEMP_OSRM_SRV_URL,
          }),
        });

        routingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          if (routes && routes[0]) {
            const coordinates = routes[0].coordinates;
            routeCoordinatesStore[lineId] = coordinates;
            onRouteReady(coordinates);
          }
        });

        routingControl.addTo(map);
      } catch (error) {
        console.error('Error creating routing control:', error);
      }
    }

    return () => {
      if (routingControl && map) {
        try {
          setTimeout(() => {
            if (routingControl._plan) {
              routingControl._plan.setWaypoints([]);
            }
            if (routingControl._line) {
              map.removeLayer(routingControl._line);
            }
            map.removeControl(routingControl);
          }, 0);
        } catch (error) {
          console.warn('Error removing routing control:', error);
        }
      }
    };
  }, [map, lineId, hidden]);

  return null;
};

export default Routing;
