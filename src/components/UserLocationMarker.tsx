import { type FC } from 'react';
import { Circle, Marker } from 'react-leaflet';
import { userLocationIcon } from './UserLocationIcon';

interface UserLocationMarkerProps {
  position: [number, number];
  accuracyRadius?: number;
}

const UserLocationMarker: FC<UserLocationMarkerProps> = ({ position, accuracyRadius = 50 }) => {
  return (
    <>
      <Circle
        center={position}
        radius={accuracyRadius}
        pathOptions={{
          fillColor: '#4285F4',
          fillOpacity: 0.15,
          color: '#4285F4',
          weight: 2,
          opacity: 0.4,
        }}
      />
      <Marker position={position} icon={userLocationIcon} />
    </>
  );
};

export default UserLocationMarker;
