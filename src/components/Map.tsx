import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { type FC, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import BusMarker from '../components/BusMarker';
import StopMarker from '../components/StopMarker';
import { lines } from '../data.ts';
import type { Line, RouteCoordinates, Stop } from '../utils';

dayjs.extend(customParseFormat);

// Store for route coordinates
const routeCoordinatesStore: RouteCoordinates = {};

// Custom user location icon
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map centering
const MapCenterController: FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  return null;
};

// Main Map Component
const Map: FC = () => {
  const [visibleRoutes, setVisibleRoutes] = useState<boolean[]>([true, true]);
  // @ts-expect-error This is a valid state
  const [selectedStop, setSelectedStop] = useState<{ stop: Stop; line: Line } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [shouldCenterOnUser, setShouldCenterOnUser] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  const defaultCenter: [number, number] = [42.453, 18.531];

  const handleStopClick = (stop: Stop, line: Line) => {
    setSelectedStop({ stop, line });
  };

  // Request user location
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setShouldCenterOnUser(true);
        setIsLoadingLocation(false);

        // Start watching position for updates
        if (watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            },
            (error) => {
              console.error('Error watching position:', error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 5000,
            },
          );
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Cleanup watch position on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Reset center flag after centering
  useEffect(() => {
    if (shouldCenterOnUser) {
      const timer = setTimeout(() => setShouldCenterOnUser(false), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldCenterOnUser]);

  return (
    <div style={{ height: '100dvh', width: '100vw', position: 'relative' }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} className="bg-[#01579b]">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Center map on user location when requested */}
        <MapCenterController center={shouldCenterOnUser ? userLocation : null} />

        {/* User location marker and accuracy circle */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={50}
              pathOptions={{
                fillColor: '#4285F4',
                fillOpacity: 0.15,
                color: '#4285F4',
                weight: 2,
                opacity: 0.4,
              }}
            />
            <Marker position={userLocation} icon={userLocationIcon} />
          </>
        )}

        {lines.map((line, index) => (
          <div key={line.id}>
            <BusMarker line={line} hidden={!visibleRoutes[index]} routeCoordinatesStore={routeCoordinatesStore} />
            {line.stops.map((stop, stopIndex) => (
              <StopMarker key={`${line.id}-${stopIndex}`} stop={stop} line={line} isVisible={visibleRoutes[index]} onStopClick={handleStopClick} />
            ))}
          </div>
        ))}
      </MapContainer>

      {/* Location button */}
      <button onClick={requestUserLocation} disabled={isLoadingLocation} className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 disabled:bg-gray-100 p-3 rounded-lg shadow-lg transition-all" title="Show my location">
        {isLoadingLocation ? (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Location error message */}
      {locationError && <div className="absolute top-20 right-4 z-[1000] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs">{locationError}</div>}

      {/* Route visibility toggles */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-2 justify-center p-4 bg-white/40 backdrop-blur-sm z-[1000]">
        <button onClick={() => setVisibleRoutes((prev) => [!prev[0], prev[1]])} className={`px-8 py-2 rounded font-semibold transition-all ${visibleRoutes[0] ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          Линија 1
        </button>
        <button onClick={() => setVisibleRoutes((prev) => [prev[0], !prev[1]])} className={`px-8 py-2 rounded font-semibold transition-all ${visibleRoutes[1] ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
          Линија 2
        </button>
      </div>
    </div>
  );
};

export default Map;
