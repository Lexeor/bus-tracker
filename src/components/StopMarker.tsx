import L from 'leaflet';
import { type FC, useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { calculateNextBuses, formatTimeUntil, getCurrentTimeInSeconds, type Line, type NextBusInfo, type Stop } from '../utils';

// Custom stop icon
const createStopIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 14 : 10;
  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: 'stop-marker-icon',
  });
};

// Stop Marker Component
const StopMarker: FC<{
  stop: Stop;
  line: Line;
  isVisible: boolean;
  onStopClick: (stop: Stop, line: Line) => void;
}> = ({ stop, line, isVisible, onStopClick }) => {
  const [nextBuses, setNextBuses] = useState<NextBusInfo[]>([]);

  useEffect(() => {
    if (!stop || !line) return;

    const updateInfo = () => {
      const currentSeconds = getCurrentTimeInSeconds();
      const buses = calculateNextBuses(stop, line, currentSeconds);
      setNextBuses(buses);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 1000);
    return () => clearInterval(interval);
  }, [stop, line]);

  if (!isVisible) return null;

  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={createStopIcon(line.color)}
      eventHandlers={{
        click: () => onStopClick(stop, line),
      }}
    >
      <Popup closeButton={false}>
        <div className="min-w-[200px] pt-6!">
          <h3 className="absolute top-0 left-0 w-full rounded-t-xl text-white px-1 py-0.5 text-center text-base" style={{ backgroundColor: line.color }}>
            {stop.name}
          </h3>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Ближайшие автобусы:</h3>
            {nextBuses.length === 0 ? (
              <p className="text-sm text-gray-500">Нет автобусов в ближайшее время</p>
            ) : (
              <div className="space-y-2">
                {nextBuses.slice(0, 3).map((bus) => (
                  <div key={`${bus.lineId}-${bus.busIndex}`} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: `${bus.color}15` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: bus.color }}>
                        {bus.lineId}
                      </div>
                      <span className="text-sm font-medium">{bus.scheduledTime}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: bus.timeUntilArrival < 60 ? '#ef4444' : bus.color }}>
                      {bus.timeUntilArrival < 0 ? 'Сейчас' : formatTimeUntil(bus.timeUntilArrival)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default StopMarker;
