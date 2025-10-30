import dayjs from 'dayjs';
import L from 'leaflet';
import { type FC, useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { type BusPosition, findClosestPointWithDirection, getCurrentTimeInSeconds, interpolateAlongRouteWithRotation, type Line, parseTimeToSeconds, type RouteCoordinates } from '../utils';
import Routing from './Routing.tsx';

// Custom bus icon with rotation
const createBusIcon = (color: string, lineId: number, rotation: number = 0) => {
  const iconHtml = `
    <div style="position: relative; width: 30px; height: 30px;">
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
      <svg xmlns="http://www.w3.org/2000/svg"
         width="24"
         height="24"
         viewBox="-2 -2 28 28"
         fill="none"
         stroke="white"
         stroke-width="2"
         stroke-linecap="round"
         stroke-linejoin="round"
         style="
           position: absolute;
           z-index: 200;
           border-radius: 50%;
           padding: 4px;
         ">
        <path d="M4 6 2 7" />
        <path d="M10 6h4" />
        <path d="m22 7-2-1" />
        <rect width="16" height="16" x="4" y="3" rx="2" />
        <path d="M4 11h16" />
        <path d="M8 15h.01" />
        <path d="M16 15h.01" />
        <path d="M6 19v2" />
        <path d="M18 21v-2" />
      </svg>
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

// Bus Markers Component
const BusMarker: FC<{ line: Line; hidden?: boolean; routeCoordinatesStore: RouteCoordinates }> = ({ line, hidden, routeCoordinatesStore }) => {
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [routeReady, setRouteReady] = useState(false);

  const handleRouteReady = () => {
    setRouteReady(true);
  };

  useEffect(() => {
    if (!routeReady || !routeCoordinatesStore[line.id] || hidden) {
      return;
    }

    const updatePositions = () => {
      const currentTime = getCurrentTimeInSeconds();
      const routeCoords = routeCoordinatesStore[line.id];
      const positions: BusPosition[] = [];

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

      setBusPositions(positions);
    };

    updatePositions();
    const interval = setInterval(updatePositions, 1000);

    return () => clearInterval(interval);
  }, [line, routeReady, hidden]);

  return (
    <>
      {!hidden && (
        <>
          <Routing stops={line.stops} color={line.color} lineId={line.id} onRouteReady={handleRouteReady} routeCoordinatesStore={routeCoordinatesStore} />
          {busPositions.map((bus) => (
            <Marker key={`bus-${line.id}-${bus.busIndex}`} position={bus.position} icon={createBusIcon(line.color, line.id, bus.rotation)}>
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: line.color }}>
                    Autobus #{bus.busIndex + 1} - Linija {line.id}
                  </h3>
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </>
  );
};

export default BusMarker;
