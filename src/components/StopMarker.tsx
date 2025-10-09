import dayjs from 'dayjs';
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
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm:ss'));

  useEffect(() => {
    if (!stop || !line) return;

    const updateInfo = () => {
      const now = dayjs();
      setCurrentTime(now.format('HH:mm:ss'));

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
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: line.color, fontSize: '14px' }}>{stop.name}</h3>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Линия {line.id}</p>

          <div className="mb-3 pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-500">Текущее время</p>
            <p className="text-sm font-semibold">{currentTime}</p>
          </div>

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
