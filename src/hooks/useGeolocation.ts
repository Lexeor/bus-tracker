import { useCallback, useEffect, useRef, useState } from 'react';

export interface GeolocationState {
  location: [number, number] | null;
  error: string | null;
  isLoading: boolean;
  shouldCenter: boolean;
}

export interface UseGeolocationReturn extends GeolocationState {
  isActive: boolean;
  requestLocation: () => void;
  stopLocation: () => void;
  clearError: () => void;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 5000,
};

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [shouldCenter, setShouldCenter] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorMessage = useCallback((error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable';
      case error.TIMEOUT:
        return 'Location request timed out';
      default:
        return 'An unknown error occurred';
    }
  }, []);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setLocation([latitude, longitude]);
  }, []);

  const handlePositionError = useCallback(
    (error: GeolocationPositionError) => {
      console.error('Error getting position:', error);
      setError(getErrorMessage(error));
      setIsLoading(false);
    },
    [getErrorMessage],
  );

  const startWatchingPosition = useCallback(() => {
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        console.error('Error watching position:', error);
      },
      WATCH_OPTIONS,
    );
  }, [handlePositionUpdate]);

  const stopLocation = useCallback((): void => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation(null);
    setIsActive(false);
    setShouldCenter(false);
  }, []);

  const requestLocation = useCallback((): void => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePositionUpdate(position);
        setShouldCenter(true);
        setIsLoading(false);
        setIsActive(true);
        startWatchingPosition();
      },
      handlePositionError,
      GEOLOCATION_OPTIONS,
    );
  }, [handlePositionUpdate, handlePositionError, startWatchingPosition]);

  // Reset center flag after centering
  useEffect(() => {
    if (shouldCenter) {
      const timer = setTimeout(() => setShouldCenter(false), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldCenter]);

  // Cleanup watch position on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    error,
    isLoading,
    isActive,
    shouldCenter,
    requestLocation,
    stopLocation,
    clearError,
  };
};
