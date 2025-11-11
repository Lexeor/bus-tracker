import { type FC, useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapCenterControllerProps {
  center: [number, number] | null;
  zoom?: number;
}

/**
 * Component to handle map centering programmatically
 * Must be used inside MapContainer
 */
const MapCenterController: FC<MapCenterControllerProps> = ({ center, zoom = 15 }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

export default MapCenterController;
