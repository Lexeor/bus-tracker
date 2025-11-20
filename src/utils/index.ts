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
  type: string;
  stops: Stop[];
}

export interface TransportPosition {
  position: [number, number];
  busIndex: number;
  fromStop: string;
  toStop: string;
  progress: number;
  isOnRoute: boolean;
  departureTime: string;
  arrivalTime: string;
  currentTime: string;
  rotation: number;
  type: string;
}

export interface NextBusInfo {
  lineId: number;
  lineName: string;
  color: string;
  busIndex: number;
  timeUntilArrival: number;
  scheduledTime: string;
}

export interface RouteGeometryData {
  coordinates: L.LatLng[];
  cumulativeDistances: number[];
  totalDistance: number;
  stopAnchors: number[];
}

export interface RouteCoordinates {
  [lineId: number]: RouteGeometryData | undefined;
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

const clampProgress = (value: number) => Math.max(0, Math.min(1, value));

const toRadians = (value: number) => (value * Math.PI) / 180;
const toDegrees = (value: number) => (value * 180) / Math.PI;

export const calculateBearing = (from: L.LatLng, to: L.LatLng): number => {
  const φ1 = toRadians(from.lat);
  const φ2 = toRadians(to.lat);
  const Δλ = toRadians(to.lng - from.lng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (toDegrees(θ) + 360) % 360;
};

const findClosestCoordinateIndex = (target: L.LatLng, coordinates: L.LatLng[]): number => {
  let closestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i];
    const distance = target.distanceTo(coord);

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
};

export const buildRouteGeometry = (coordinates: L.LatLng[], stops: Stop[]): RouteGeometryData => {
  const cumulativeDistances: number[] = [0];

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const current = coordinates[i];
    const distance = prev.distanceTo(current);
    cumulativeDistances[i] = cumulativeDistances[i - 1] + distance;
  }

  const totalDistance = cumulativeDistances[cumulativeDistances.length - 1] ?? 0;
  const stopAnchors = stops.map((stop) => {
    const stopPoint = L.latLng(stop.lat, stop.lng);
    return findClosestCoordinateIndex(stopPoint, coordinates);
  });

  return {
    coordinates,
    cumulativeDistances,
    totalDistance,
    stopAnchors,
  };
};

const deriveRotationForAnchor = (geometry: RouteGeometryData, anchorIndex: number): number => {
  const { coordinates } = geometry;

  if (!coordinates.length) {
    return 0;
  }

  const current = coordinates[anchorIndex];

  if (!current) {
    return 0;
  }

  if (anchorIndex < coordinates.length - 1) {
    return calculateBearing(current, coordinates[anchorIndex + 1]);
  }

  if (anchorIndex > 0) {
    return calculateBearing(coordinates[anchorIndex - 1], current);
  }

  return 0;
};

export const getRotationForAnchor = (geometry: RouteGeometryData, anchorIndex: number): number => {
  return deriveRotationForAnchor(geometry, anchorIndex);
};

export const interpolateBetweenAnchors = (
  geometry: RouteGeometryData,
  fromAnchor: number,
  toAnchor: number,
  rawProgress: number,
): {
  position: [number, number];
  rotation: number;
} | null => {
  const { coordinates, cumulativeDistances } = geometry;

  if (!coordinates.length) {
    return null;
  }

  const fromDistance = cumulativeDistances[fromAnchor];
  const toDistance = cumulativeDistances[toAnchor];

  if (fromDistance === undefined || toDistance === undefined) {
    return null;
  }

  const distanceDelta = toDistance - fromDistance;

  if (distanceDelta === 0) {
    const anchorCoord = coordinates[fromAnchor];
    return {
      position: [anchorCoord.lat, anchorCoord.lng],
      rotation: deriveRotationForAnchor(geometry, fromAnchor),
    };
  }

  if (distanceDelta < 0) {
    return null;
  }

  const progress = clampProgress(rawProgress);
  const targetDistance = fromDistance + distanceDelta * progress;

  let segmentIndex = fromAnchor;

  while (
    segmentIndex < toAnchor &&
    cumulativeDistances[segmentIndex + 1] !== undefined &&
    cumulativeDistances[segmentIndex + 1] < targetDistance
  ) {
    segmentIndex++;
  }

  const nextIndex = Math.min(segmentIndex + 1, coordinates.length - 1);
  const startCoord = coordinates[segmentIndex];
  const endCoord = coordinates[nextIndex];
  const startDistance = cumulativeDistances[segmentIndex];
  const endDistance = cumulativeDistances[nextIndex];
  const segmentLength = Math.max(endDistance - startDistance, 1);
  const segmentProgress = Math.max(0, Math.min(1, (targetDistance - startDistance) / segmentLength));

  const lat = startCoord.lat + (endCoord.lat - startCoord.lat) * segmentProgress;
  const lng = startCoord.lng + (endCoord.lng - startCoord.lng) * segmentProgress;
  const rotation = calculateBearing(startCoord, endCoord);

  return {
    position: [lat, lng],
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
