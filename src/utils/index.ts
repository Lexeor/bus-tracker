// Types
import dayjs from 'dayjs';
import L from 'leaflet';

export interface Stop {
  name: string;
  lat: number;
  lng: number;
  time: string[];
}

export interface Line {
  id: number;
  name: string;
  color: string;
  stops: Stop[];
}

export interface BusPosition {
  position: [number, number];
  busIndex: number;
  fromStop: string;
  toStop: string;
  progress: number;
  isOnRoute: boolean;
  departureTime: string;
  arrivalTime: string;
  currentTime: string;
  rotation: number; // Add rotation angle
}

export interface NextBusInfo {
  lineId: number;
  lineName: string;
  color: string;
  busIndex: number;
  timeUntilArrival: number;
  scheduledTime: string;
}

export interface RouteCoordinates {
  [lineId: number]: L.LatLng[];
}

// Utils
export const parseTimeToSeconds = (timeStr: string): number => {
  const parsed = dayjs(timeStr, 'HH:mm');
  return parsed.hour() * 3600 + parsed.minute() * 60;
};

export const getCurrentTimeInSeconds = (): number => {
  const now = dayjs();
  return now.hour() * 3600 + now.minute() * 60 + now.second();
};

export const formatTimeUntil = (seconds: number): string => {
  if (seconds < 60) return `${seconds} sek`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}s ${mins}m`;
};

// Calculate angle between two points
export const calculateAngle = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  return angle;
};

// Find closest point on route and calculate direction
export const findClosestPointWithDirection = (
  targetLat: number,
  targetLng: number,
  routeCoordinates: L.LatLng[],
): {
  index: number;
  rotation: number;
} => {
  let closestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < routeCoordinates.length; i++) {
    const coord = routeCoordinates[i];
    const distance = Math.sqrt(Math.pow(coord.lat - targetLat, 2) + Math.pow(coord.lng - targetLng, 2));

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  // Calculate rotation based on direction to next point
  let rotation = 0;
  if (closestIndex < routeCoordinates.length - 1) {
    const current = routeCoordinates[closestIndex];
    const next = routeCoordinates[closestIndex + 1];
    rotation = calculateAngle(current.lat, current.lng, next.lat, next.lng);
  } else if (closestIndex > 0) {
    // If at the end, use direction from previous point
    const prev = routeCoordinates[closestIndex - 1];
    const current = routeCoordinates[closestIndex];
    rotation = calculateAngle(prev.lat, prev.lng, current.lat, current.lng);
  }

  return { index: closestIndex, rotation };
};

// Interpolate along route with rotation
export const interpolateAlongRouteWithRotation = (
  routeCoordinates: L.LatLng[],
  fromIndex: number,
  toIndex: number,
  progress: number,
): {
  position: [number, number];
  rotation: number;
} | null => {
  if (!routeCoordinates || routeCoordinates.length === 0) return null;

  const totalSegment = toIndex - fromIndex;
  const targetIndex = Math.floor(fromIndex + totalSegment * progress);
  const clampedIndex = Math.max(0, Math.min(routeCoordinates.length - 1, targetIndex));

  const coord = routeCoordinates[clampedIndex];

  // Calculate rotation
  let rotation = 0;
  if (clampedIndex < routeCoordinates.length - 1) {
    const next = routeCoordinates[clampedIndex + 1];
    rotation = calculateAngle(coord.lat, coord.lng, next.lat, next.lng);
  } else if (clampedIndex > 0) {
    const prev = routeCoordinates[clampedIndex - 1];
    rotation = calculateAngle(prev.lat, prev.lng, coord.lat, coord.lng);
  }

  return {
    position: [coord.lat, coord.lng],
    rotation,
  };
};

// Calculate next buses for a stop
export const calculateNextBuses = (stop: Stop, line: Line, currentTimeSeconds: number): NextBusInfo[] => {
  const nextBuses: NextBusInfo[] = [];

  const stopIndexInLine = line.stops.findIndex((s) => s.lat === stop.lat && s.lng === stop.lng && s.name === stop.name);

  if (stopIndexInLine === -1) return nextBuses;

  stop.time.forEach((scheduledTime, busIndex) => {
    const arrivalTimeSeconds = parseTimeToSeconds(scheduledTime);
    const timeUntil = arrivalTimeSeconds - currentTimeSeconds;

    // Show buses that will arrive in the next 2 hours or are currently at the stop (within 1 minute)
    if (timeUntil >= -60 && timeUntil <= 7200) {
      nextBuses.push({
        lineId: line.id,
        lineName: line.name,
        color: line.color,
        busIndex,
        timeUntilArrival: timeUntil,
        scheduledTime,
      });
    }
  });

  return nextBuses.sort((a, b) => a.timeUntilArrival - b.timeUntilArrival);
};
