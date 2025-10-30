import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { motion } from 'motion/react';
import { type FC, useEffect, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import BusMarker from '../components/BusMarker';
import Disclaimer from '../components/Disclaimer.tsx';
import StopMarker from '../components/StopMarker';
import { defaultCenter, VISIBLE_ROUTES_KEY } from '../constants.ts';
import { lines } from '../data.ts';
import { useLocalStorageBooleanArray } from '../hooks/use-local-storage';
import type { RouteCoordinates } from '../utils';
import { userLocationIcon } from './UserLocationIcon.tsx';

dayjs.extend(customParseFormat);

// Store for route coordinates
const routeCoordinatesStore: RouteCoordinates = {};

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
  const [visibleRoutes, setVisibleRoutes] = useLocalStorageBooleanArray(VISIBLE_ROUTES_KEY, [true, true]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [shouldCenterOnUser, setShouldCenterOnUser] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Request user location
  const requestUserLocation = (): void => {
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
              <StopMarker key={`${line.id}-${stopIndex}`} stop={stop} line={line} isVisible={visibleRoutes[index]} />
            ))}
          </div>
        ))}
      </MapContainer>

      {/* Location button */}
      <motion.button
        onClick={requestUserLocation}
        disabled={isLoadingLocation}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 disabled:bg-gray-100 p-3 rounded-lg shadow-lg transition-all"
        title="Show my location"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoadingLocation ? (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </motion.button>

      <Disclaimer />

      {/* Location error message */}
      {locationError && (
        <div className="absolute top-20 right-4 z-[1000] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs">
          {locationError}
        </div>
      )}

      {/* Route visibility toggles */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 z-[1000] text-black">
        <div className="bg-white/40 backdrop-blur-sm rounded-sm p-4 pt-2 w-full md:w-auto text-center">
          <h3>Autobuske linije</h3>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setVisibleRoutes((prev) => [!prev[0], prev[1]])}
              className={`px-8 py-2 rounded font-semibold transition-all cursor-pointer ${visibleRoutes[0] ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              1
            </button>
            <button
              onClick={() => setVisibleRoutes((prev) => [prev[0], !prev[1]])}
              className={`px-8 py-2 rounded font-semibold transition-all cursor-pointer ${visibleRoutes[1] ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
