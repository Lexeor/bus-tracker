import { calculateNextBuses, formatTimeUntil, getCurrentTimeInSeconds, type Line, type NextBusInfo, type Stop } from '@/utils';
import { useLingui } from '@lingui/react';
import L from 'leaflet';
import { type FC, useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';

interface LineGroup {
  lineId: number;
  lineName: string;
  color: string;
  buses: NextBusInfo[];
}

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
  otherEntries?: Array<{ stop: Stop; line: Line }>;
  onStopClick?: (stop: Stop, line: Line) => void;
}> = ({ stop, line, isVisible, otherEntries = [], onStopClick }) => {
  const { i18n } = useLingui();

  const [lineGroups, setLineGroups] = useState<LineGroup[]>([]);

  useEffect(() => {
    if (!stop || !line) return;

    const updateInfo = () => {
      const currentSeconds = getCurrentTimeInSeconds();
      const groups: LineGroup[] = [
        { lineId: line.id, lineName: line.name, color: line.color, buses: calculateNextBuses(stop, line, currentSeconds) },
        ...otherEntries.map(({ stop: s, line: l }) => ({
          lineId: l.id,
          lineName: l.name,
          color: l.color,
          buses: calculateNextBuses(s, l, currentSeconds),
        })),
      ];
      setLineGroups(groups);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 1000);
    return () => clearInterval(interval);
  }, [stop, line, otherEntries]);

  if (!isVisible) return null;

  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={createStopIcon(line.color)}
      eventHandlers={{
        click: () => onStopClick?.(stop, line),
      }}
    >
      <Popup closeButton={false}>
        <div className="min-w-[200px] pt-6!">
          <h3 className="absolute top-0 left-0 w-full rounded-t-xl text-white px-1 py-1.5 text-center" style={{ backgroundColor: line.color }}>
            {stop.name}
          </h3>

          <h3 className="text-sm font-semibold text-gray-700 mb-2">{i18n._(line.type === 'ferry' ? 'nextFerries' : 'nextBuses')}</h3>

          {lineGroups.map((group, groupIdx) => (
            <div key={group.lineId}>
              {groupIdx > 0 && (
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                    <span className="text-xs text-gray-500 font-medium">{group.lineName}</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}
              {group.buses.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{i18n._('noTransportToday')}</p>
              ) : (
                <div className="space-y-1.5">
                  {group.buses.slice(0, 3).map((bus) => (
                    <div key={`${bus.lineId}-${bus.busIndex}`} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: `${bus.color}15` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: bus.color }}>
                          {bus.lineId}
                        </div>
                        <span className="text-sm font-medium">{bus.scheduledTime}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: bus.timeUntilArrival < 60 ? '#ef4444' : bus.color }}>
                        {bus.timeUntilArrival < 0 ? i18n._('now') : formatTimeUntil(bus.timeUntilArrival)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Popup>
    </Marker>
  );
};

export default StopMarker;
