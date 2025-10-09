import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'leaflet-routing-machine';
import { type FC, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import BusMarker from '../components/BusMarker';
import StopMarker from '../components/StopMarker';
import { lines } from '../data.ts';
import type { Line, RouteCoordinates, Stop } from '../utils';

dayjs.extend(customParseFormat);

// Store for route coordinates
const routeCoordinatesStore: RouteCoordinates = {};

// Main Map Component
const Map: FC = () => {
  const [visibleRoutes, setVisibleRoutes] = useState([true, true]);
  const [selectedStop, setSelectedStop] = useState<{ stop: Stop; line: Line } | null>(null);
  const center: [number, number] = [42.453, 18.531];

  const handleStopClick = (stop: Stop, line: Line) => {
    setSelectedStop({ stop, line });
  };

  return (
    <div style={{ height: '100dvh', width: '100vw', position: 'relative' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} className="bg-[#01579b]">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {lines.map((line, index) => (
          <div key={line.id}>
            <BusMarker line={line} hidden={!visibleRoutes[index]} routeCoordinatesStore={routeCoordinatesStore} />
            {line.stops.map((stop, stopIndex) => (
              <StopMarker key={`${line.id}-${stopIndex}`} stop={stop} line={line} isVisible={visibleRoutes[index]} onStopClick={handleStopClick} />
            ))}
          </div>
        ))}

        {/*<RouteStatus />*/}
      </MapContainer>

      <div className="absolute bottom-0 left-0 right-0 flex gap-2 justify-center p-4 bg-white/40 backdrop-blur-sm z-[1000]">
        <button onClick={() => setVisibleRoutes((prev) => [!prev[0], prev[1]])} className={`px-8 py-2 rounded font-semibold transition-all ${visibleRoutes[0] ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          Линия 1
        </button>
        <button onClick={() => setVisibleRoutes((prev) => [prev[0], !prev[1]])} className={`px-8 py-2 rounded font-semibold transition-all ${visibleRoutes[1] ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
          Линия 2
        </button>
      </div>
    </div>
  );
};

export default Map;
