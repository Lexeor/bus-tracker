import Disclaimer from '@/components/Disclaimer';
import LanguageSwitch from '@/components/LanguageSwitch';
import LocationErrorMessage from '@/components/LocationErrorMessage';
import MapCenterController from '@/components/MapCenterController';
import RouteFocusController from '@/components/RouteFocusController';
import RouteMarkers from '@/components/RouteMarkers';
import UserLocationButton from '@/components/UserLocationButton';
import UserLocationMarker from '@/components/UserLocationMarker';
import { defaultCenter, VISIBLE_ROUTES_KEY } from '@/constants';
import { lines } from '@/data';
import { useLocalStorageBooleanArray } from '@/hooks/use-local-storage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useInitialRoutesFlash } from '@/hooks/useInitialRoutesFlash';
import { useLanguageInit } from '@/hooks/useLanguageInit';
import { routeCoordinatesStore } from '@/store/routeCoordinatesStore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { type FC, useMemo, useState } from 'react';
import { MapContainer, ScaleControl, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import RoutesPanel from './RoutesPanel';

dayjs.extend(customParseFormat);

/**
 * Main Map Component
 * Orchestrates the map view with user location, routes, and controls
 */
const Map: FC = () => {
  // Language initialization
  useLanguageInit();

  // Routes visibility state
  const [visibleRoutes, setVisibleRoutes] = useLocalStorageBooleanArray(
    VISIBLE_ROUTES_KEY,
    Array(lines.length).fill(false),
  );

  // Focused route state
  const [focusedRouteIndex, setFocusedRouteIndex] = useState<number | null>(null);

  // Initial routes flash effect (workaround for initial bus rendering)
  useInitialRoutesFlash(setVisibleRoutes, lines.length);

  // Geolocation management
  const {
    location: userLocation,
    error: locationError,
    isLoading: isLoadingLocation,
    shouldCenter: shouldCenterOnUser,
    requestLocation,
    clearError,
  } = useGeolocation();

  // Memoize center value to avoid unnecessary re-renders
  const mapCenter = useMemo(() => (shouldCenterOnUser ? userLocation : null), [shouldCenterOnUser, userLocation]);

  // Get focused line data
  const focusedLine = useMemo(() => {
    if (focusedRouteIndex === null) return null;
    return lines[focusedRouteIndex] || null;
  }, [focusedRouteIndex]);

  return (
    <div className="h-dvh w-screen fixed inset-0 overflow-hidden">
      <MapContainer center={defaultCenter} zoom={13} className="h-full w-full bg-[#01579b]" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ScaleControl position="bottomright" />

        {/* Center map on user location when requested */}
        <MapCenterController center={mapCenter} />

        {/* Focus on selected route */}
        <RouteFocusController focusedLine={focusedLine} />

        {/* User location marker and accuracy circle */}
        {userLocation && <UserLocationMarker position={userLocation} />}

        {/* Route markers (buses and stops) */}
        <RouteMarkers lines={lines} visibleRoutes={visibleRoutes} routeCoordinatesStore={routeCoordinatesStore} />
      </MapContainer>

      {/* UI Controls */}
      <UserLocationButton onClick={requestLocation} isLoading={isLoadingLocation} />

      <Disclaimer />

      <LanguageSwitch />

      {/* Location error message */}
      <LocationErrorMessage error={locationError} onDismiss={clearError} />

      <RoutesPanel
        visibleRoutes={visibleRoutes}
        setVisibleRoutes={setVisibleRoutes}
        onRouteFocus={setFocusedRouteIndex}
      />
    </div>
  );
};

export default Map;
