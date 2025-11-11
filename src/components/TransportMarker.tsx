import {
  findClosestPointWithDirection,
  getCurrentTimeInSeconds,
  interpolateAlongRouteWithRotation,
  type Line,
  parseTimeToSeconds,
  type RouteCoordinates,
  type TransportPosition,
} from '@/utils';
import { useLingui } from '@lingui/react';
import dayjs from 'dayjs';
import L from 'leaflet';
import { type FC, useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import Routing from './Routing.tsx';

const busIcon = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="-2 -2 28 28"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="position: absolute; z-index: 200; border-radius: 50%; padding: 4px;"
    >
      <path d="M4 6 2 7" />
      <path d="M10 6h4" />
      <path d="m22 7-2-1" />
      <rect width="16" height="16" x="4" y="3" rx="2" />
      <path d="M4 11h16" />
      <path d="M8 15h.01" />
      <path d="M16 15h.01" />
      <path d="M6 19v2" />
      <path d="M18 21v-2" />
    </svg>`;

const ferryIcon = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="position: absolute; z-index: 200; border-radius: 50%; padding: 4px;"
    >
      <path d="M12 10.189V14" />
      <path d="M12 2v3" />
      <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76" />
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>`;

// Custom bus icon with rotation
const createTransportIcon = (color: string, lineId: number, rotation: number = 0, type: string = 'bus') => {
  const iconHtml = `
    <div style="position: relative; width: 30px; height: 30px; z-index: 2000">
      <div style="
        position: absolute;
        background-color: white;
        font-size: 12px;
        width: 32px;
        height: 20px;
        top: 2px;
        left: -16px;
        display: flex;
        justify-content: start;
        align-items: center;
        padding: 2px 6px;
        border-radius: 6px;
        color: ${color};
        font-weight: 600;
        z-index: 1;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">${lineId}</div>
      ${type === 'bus' ? busIcon : ferryIcon}
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        background-color: ${color};
        border-radius: 0 99px 99px 99px;
        border: 2px solid white;
        transform: rotate(${rotation + 45}deg);
        transition: transform 0.3s ease;
        z-index: 190;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'bus-marker-icon',
  });
};

interface BusMarkerProps {
  line: Line;
  hidden?: boolean;
  routeCoordinatesStore: RouteCoordinates;
}

// Bus Markers Component
const TransportMarker: FC<BusMarkerProps> = ({ line, hidden, routeCoordinatesStore }) => {
  const [transportPositions, setTransportPositions] = useState<TransportPosition[]>([]);
  const [routeReady, setRouteReady] = useState(false);
  const { i18n } = useLingui();

  const handleRouteReady = () => {
    setRouteReady(true);
  };

  useEffect(() => {
    if (!routeReady || !routeCoordinatesStore[line.id]) {
      return;
    }

    const updatePositions = () => {
      const currentTime = getCurrentTimeInSeconds();
      const routeCoords = routeCoordinatesStore[line.id];
      const positions: TransportPosition[] = [];

      // Calculate bus positions with rotation
      const busCount = line.stops[0].time.length;

      for (let busIndex = 0; busIndex < busCount; busIndex++) {
        const firstStopTime = parseTimeToSeconds(line.stops[0].time[busIndex]);
        const lastStopTime = parseTimeToSeconds(line.stops[line.stops.length - 1].time[busIndex]);

        if (currentTime < firstStopTime || currentTime > lastStopTime) {
          continue;
        }

        let found = false;

        for (let stopIndex = 0; stopIndex < line.stops.length - 1; stopIndex++) {
          const currentStop = line.stops[stopIndex];
          const nextStop = line.stops[stopIndex + 1];

          const currentStopTime = parseTimeToSeconds(currentStop.time[busIndex]);
          const nextStopTime = parseTimeToSeconds(nextStop.time[busIndex]);

          if (currentTime >= currentStopTime && currentTime < nextStopTime) {
            const totalTime = nextStopTime - currentStopTime;
            const elapsedTime = currentTime - currentStopTime;
            const progress = totalTime > 0 ? elapsedTime / totalTime : 0;

            const fromPoint = findClosestPointWithDirection(currentStop.lat, currentStop.lng, routeCoords);
            const toPoint = findClosestPointWithDirection(nextStop.lat, nextStop.lng, routeCoords);

            const result = interpolateAlongRouteWithRotation(routeCoords, fromPoint.index, toPoint.index, progress);

            if (result) {
              const currentTimeStr = dayjs().format('HH:mm:ss');
              positions.push({
                position: result.position,
                rotation: result.rotation,
                busIndex,
                fromStop: currentStop.name,
                toStop: nextStop.name,
                progress,
                type: line.type,
                isOnRoute: true,
                departureTime: line.stops[0].time[busIndex],
                arrivalTime: line.stops[line.stops.length - 1].time[busIndex],
                currentTime: currentTimeStr,
              });
            }

            found = true;
            break;
          }
        }

        if (!found && currentTime >= lastStopTime - 60 && currentTime <= lastStopTime) {
          const lastStop = line.stops[line.stops.length - 1];
          const currentTimeStr = dayjs().format('HH:mm:ss');

          // Calculate rotation for last stop
          const lastStopPoint = findClosestPointWithDirection(lastStop.lat, lastStop.lng, routeCoords);

          positions.push({
            position: [lastStop.lat, lastStop.lng],
            type: line.type,
            rotation: lastStopPoint.rotation,
            busIndex,
            fromStop: lastStop.name,
            toStop: 'Конечная остановка',
            progress: 1,
            isOnRoute: true,
            departureTime: line.stops[0].time[busIndex],
            arrivalTime: line.stops[line.stops.length - 1].time[busIndex],
            currentTime: currentTimeStr,
          });
        }
      }

      setTransportPositions(positions);
    };

    updatePositions();
    const interval = setInterval(updatePositions, 1000);

    return () => clearInterval(interval);
  }, [line, routeReady, hidden]);

  return (
    <>
      <Routing
        stops={line.stops}
        color={line.color}
        lineId={line.id}
        onRouteReady={handleRouteReady}
        routeCoordinatesStore={routeCoordinatesStore}
        hidden={hidden}
      />
      {transportPositions.map((transport) => {
        // Hide ferry markers when line is hidden
        if (hidden && line.type === 'ferry') {
          return null;
        }

        return (
          <Marker
            key={`bus-${line.id}-${transport.busIndex}`}
            position={transport.position}
            icon={createTransportIcon(line.color, line.id, transport.rotation, line.type)}
          >
            <Popup>
              <div style={{ minWidth: '250px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: line.color }}>
                  {line.type === 'bus' ? i18n._('bus') : i18n._('ferry')} #{transport.busIndex + 1} - {i18n._('line')}{' '}
                  {line.id}
                </h3>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default TransportMarker;
